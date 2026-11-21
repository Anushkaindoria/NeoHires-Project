// "Refresh now" endpoint: demo mein button dabate hi naya data aa jaye.
// Cooldown isliye hai ki koi baar-baar dabake external sites ko spam na kare.
const express = require("express");
const { runPipeline } = require("../services/pipeline");

const router = express.Router();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minute
let running = false;
let lastRun = 0;
let lastReport = null;

// POST /api/ingest/run
router.post("/run", async (req, res) => {
  if (running) return res.status(409).json({ message: "Refresh already running" });

  const wait = lastRun + COOLDOWN_MS - Date.now();
  if (wait > 0) {
    return res.status(429).json({
      message: `Recently refreshed. Try again in ${Math.ceil(wait / 1000)}s.`,
      lastReport,
    });
  }

  running = true;
  try {
    lastReport = await runPipeline();
    lastRun = Date.now();
    res.json({ message: "Refresh complete", report: lastReport });
  } catch (err) {
    res.status(500).json({ message: "Refresh failed" });
  } finally {
    running = false;
  }
});

// GET /api/ingest/status
router.get("/status", (req, res) => {
  res.json({ running, lastRun: lastRun ? new Date(lastRun) : null, lastReport });
});

module.exports = router;