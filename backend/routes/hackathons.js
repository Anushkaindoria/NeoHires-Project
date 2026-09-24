const express = require("express");
const Hackathon = require("../models/Hackathon");

const router = express.Router();

const normalizeDeadline = (deadlineValue) => {
  if (!deadlineValue) return null;
  const parsedDate = new Date(deadlineValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

// GET all hackathons
router.get("/", async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ deadline: 1 });
    res.json(hackathons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET hackathon by id
router.get("/:id", async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    return res.json(hackathon);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST create hackathon
router.post("/", async (req, res) => {
  try {
    const parsedDeadline = normalizeDeadline(req.body.deadline);

    if (!req.body.company || !req.body.name || !req.body.theme || !parsedDeadline) {
      return res.status(400).json({
        message: "company, name, theme, and deadline are required",
      });
    }

    const hackathon = await Hackathon.create({
      ...req.body,
      deadline: parsedDeadline,
    });

    return res.status(201).json(hackathon);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT update hackathon
router.put("/:id", async (req, res) => {
  try {
    const parsedDeadline = normalizeDeadline(req.body.deadline);

    if (req.body.deadline && !parsedDeadline) {
      return res.status(400).json({ message: "Invalid deadline format" });
    }

    const updateData = { ...req.body };
    if (parsedDeadline) {
      updateData.deadline = parsedDeadline;
    }

    const hackathon = await Hackathon.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    return res.json(hackathon);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE hackathon
router.delete("/:id", async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    return res.json({ message: "Hackathon deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
