const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Internship = require("../models/Internship");
const { analyzeForInternship } = require("../services/resumeAnalyzer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Extract text from the uploaded file. Returns { error, status } on failure.
async function extractText(file) {
  if (!file) return { error: "Please upload a resume (PDF or TXT).", status: 400 };

  const { mimetype, originalname, buffer } = file;
  let text = "";

  if (mimetype === "application/pdf" || /\.pdf$/i.test(originalname)) {
    text = (await pdfParse(buffer)).text;
  } else if (mimetype === "text/plain" || /\.txt$/i.test(originalname)) {
    text = buffer.toString("utf8");
  } else {
    return { error: "Only PDF or TXT files are allowed.", status: 400 };
  }

  if (text.trim().length < 50) {
    return {
      error: "Could not read text from this file. It may be a scanned/image PDF. Please upload a text-based PDF.",
      status: 422,
    };
  }
  return { text };
}

// Check a resume against one particular internship
router.post("/analyze/:internshipId", upload.single("resume"), async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.internshipId).lean();
    if (!internship) return res.status(404).json({ message: "Internship not found." });

    const { text, error, status } = await extractText(req.file);
    if (error) return res.status(status).json({ message: error });

    res.json(analyzeForInternship(text, internship));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;