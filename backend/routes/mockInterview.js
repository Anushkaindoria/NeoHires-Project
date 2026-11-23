const express = require("express");
const crypto = require("crypto");
const { requireAuth } = require("./auth");
const {
  buildQuestionSet,
  scoreAnswer,
  reaction,
  buildReport,
} = require("../lib/interviewEngine");
const rateLimit = require("../lib/rateLimit");

const router = express.Router();
const sessions = new Map();
const DURATION_MS = 10 * 60 * 1000;

router.use(requireAuth);
router.use(rateLimit({ windowMs: 60 * 1000, max: 20 }));

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.startedAt > 60 * 60 * 1000) sessions.delete(id);
  }
}, 10 * 60 * 1000);

const getSession = (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session || String(session.userId) !== String(req.user._id)) {
    res.status(404).json({ message: "Session not found" });
    return null;
  }
  return session;
};

router.post("/start", (req, res) => {
  try {
    const role = (req.body.role || "").trim();
    if (!role) return res.status(400).json({ message: "Role is required" });

    const questions = buildQuestionSet(role);
    const name = req.user.name || "there";
    const first = `Hello ${name}, I am Priya. Let's begin your ${role} interview. ${questions[0].q}`;

    const id = crypto.randomUUID();
    sessions.set(id, {
      userId: req.user._id,
      role,
      questions,
      current: 0,
      results: [],
      transcript: [{ role: "model", text: first }],
      startedAt: Date.now(),
      durationMs: DURATION_MS,
    });

    return res.status(201).json({ sessionId: id, question: first, durationMs: DURATION_MS });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/:id/answer", async (req, res) => {
  try {
    const session = getSession(req, res);
    if (!session) return;

    const answer = (req.body.answer || "").trim();
    if (!answer) return res.status(400).json({ message: "Answer is required" });

    const elapsed = Date.now() - session.startedAt;
    if (elapsed >= session.durationMs) {
      return res.status(400).json({ timeUp: true, message: "Time is up. Please end the interview." });
    }

    const q = session.questions[session.current];
    const base = scoreAnswer(answer.slice(0, 2000), q.keywords);
const { matched, wordCount } = base;
let score = base.score;
try {
  const r = await fetch("http://127.0.0.1:8000/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer: answer.slice(0, 2000), keywords: q.keywords }),
  });
  if (r.ok) score = (await r.json()).score;
} catch (e) {
  // ML API is down: keep the keyword score
}
    session.results.push({
      question: q.q,
      score,
      matched,
      total: q.keywords.length,
      wordCount,
    });
    session.transcript.push({ role: "user", text: answer.slice(0, 2000) });
    session.current += 1;

    let question;
    let finished = false;
    if (session.current >= session.questions.length) {
      question = `${reaction(score)} That was the last question. Please end the interview to see your feedback.`;
      finished = true;
    } else {
      question = `${reaction(score)} ${session.questions[session.current].q}`;
    }
    session.transcript.push({ role: "model", text: question });

    return res.json({
      question,
      finished,
      timeLeftMs: session.durationMs - (Date.now() - session.startedAt),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/:id/end", (req, res) => {
  try {
    const session = getSession(req, res);
    if (!session) return;

    const report = buildReport(session.results);
    sessions.delete(req.params.id);
    return res.json({ report });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;