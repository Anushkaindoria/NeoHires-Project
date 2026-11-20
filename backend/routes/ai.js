const express = require("express");
const mongoose = require("mongoose");
const Internship = require("../models/Internship");
const Hackathon = require("../models/Hackathon");
const { rateLimit } = require("../middleware/rateLimit");
const nlp = require("../services/nlp");

const router = express.Router();
router.use(rateLimit({ windowMs: 60_000, max: 20 })); // 20 requests/min per IP

const MAX_TEXT = 20000;
const badText = (s) => typeof s !== "string" || s.trim().length < 20 || s.length > MAX_TEXT;

// POST /api/ai/search  { query }
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (typeof query !== "string" || !query.trim() || query.length > 300)
      return res.status(400).json({ message: "query (1-300 chars) required" });

    const [interns, hacks] = await Promise.all([Internship.find().lean(), Hackathon.find().lean()]);
    const items = [
      ...interns.map((i) => ({ ...i, _kind: "internship" })),
      ...hacks.map((h) => ({ ...h, _kind: "hackathon" })),
    ];
    const intent = nlp.parseIntent(query);
    const results = nlp.rankListings(items, intent).slice(0, 20);
    res.json({ intent, count: results.length, results });
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});

// POST /api/ai/assistant  { type: "internship"|"hackathon", id, question }
router.post("/assistant", async (req, res) => {
  try {
    const { type, id, question } = req.body || {};
    if (!["internship", "hackathon"].includes(type) || !mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "valid type and id required" });
    if (typeof question !== "string" || question.length > 300)
      return res.status(400).json({ message: "question (max 300 chars) required" });

    const Model = type === "internship" ? Internship : Hackathon;
    const listing = await Model.findById(id).lean();
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(nlp.answerQuestion(listing, type, question));
  } catch (err) {
    res.status(500).json({ message: "Assistant failed" });
  }
});

// POST /api/ai/summarize  { text, maxSentences? }
router.post("/summarize", (req, res) => {
  const { text, maxSentences } = req.body || {};
  if (badText(text)) return res.status(400).json({ message: "text must be 20-20000 chars" });
  const n = Math.min(Math.max(parseInt(maxSentences) || 3, 1), 8);
  res.json(nlp.summarize(text, n));
});

// POST /api/ai/skill-gap  { resumeText, jdText }
router.post("/skill-gap", (req, res) => {
  const { resumeText, jdText } = req.body || {};
  if (badText(resumeText) || badText(jdText))
    return res.status(400).json({ message: "resumeText and jdText must be 20-20000 chars" });
  const result = nlp.skillGap(resumeText, jdText);
  if (result.matchPercent === null)
    return res.status(422).json({ message: "Job description mein koi known skill nahi mila" });
  res.json(result);
});

module.exports = router;