const express = require("express");
const Internship = require("../models/Internship");

const router = express.Router();

const normalizeDeadline = (deadlineValue) => {
  if (!deadlineValue) return null;

  const parsedDate = new Date(deadlineValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

// GET all internships
router.get("/", async (req, res) => {
  try {
    const internships = await Internship.find().sort({ deadline: 1 });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single internship by id
router.get("/:id", async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    return res.json(internship);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST create internship
router.post("/", async (req, res) => {
  try {
    const parsedDeadline = normalizeDeadline(req.body.deadline);

    if (!req.body.company || !req.body.name || !req.body.role || !parsedDeadline) {
      return res.status(400).json({
        message: "company, name, role, and deadline are required",
      });
    }

    const internship = await Internship.create({
      ...req.body,
      deadline: parsedDeadline,
    });

    return res.status(201).json(internship);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT update internship
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

    const internship = await Internship.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    return res.json(internship);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE internship
router.delete("/:id", async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    return res.json({ message: "Internship deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
