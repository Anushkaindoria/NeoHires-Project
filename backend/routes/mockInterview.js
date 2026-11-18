const express = require("express");
const crypto = require("crypto");
const { requireAuth } = require("./auth");
const { askGemini } = require("../lib/gemini");
const { buildInterviewPrompt, FEEDBACK_PROMPT } = require("../lib/persona");
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

const handleError = (err, res) => {
  if (err.message === "AI_BUSY") {
    return res.status(503).json({ message: "AI is busy right now. Please try again." });
  }
  return res.status(500).json({ message: err.message });
};

router.post("/start", async (req, res) => {
  try {
    const role = (req.body.role || "").trim();
    if (!role) return res.status(400).json({ message: "Role is required" });

    const systemPrompt = buildInterviewPrompt(role, req.user.name);
    const history = [{ role: "user", text: "Hello, I am ready for the interview." }];
    const question = await askGemini(systemPrompt, history);
    history.push({ role: "model", text: question });

    const id = crypto.randomUUID();
    sessions.set(id, {
      userId: req.user._id,
      role,
      systemPrompt,
      history,
      startedAt: Date.now(),
      durationMs: DURATION_MS,
    });

    return res.status(201).json({ sessionId: id, question, durationMs: DURATION_MS });
  } catch (err) {
    return handleError(err, res);
  }
});

router.post("/:id/answer", async (req, res) => {
  let session;
  try {
    session = getSession(req, res);
    if (!session) return;

    const answer = (req.body.answer || "").trim();
    if (!answer) return res.status(400).json({ message: "Answer is required" });

    const elapsed = Date.now() - session.startedAt;
    if (elapsed >= session.durationMs) {
      return res.status(400).json({ timeUp: true, message: "Time is up. Please end the interview." });
    }

    session.history.push({ role: "user", text: answer.slice(0, 2000) });
    const question = await askGemini(session.systemPrompt, session.history);
    session.history.push({ role: "model", text: question });

    return res.json({
      question,
      timeLeftMs: session.durationMs - (Date.now() - session.startedAt),
    });
  } catch (err) {
    if (session) session.history.pop();
    return handleError(err, res);
  }
});

router.post("/:id/end", async (req, res) => {
  try {
    const session = getSession(req, res);
    if (!session) return;

    const transcript = session.history
      .map((m) => `${m.role === "model" ? "Interviewer" : "Candidate"}: ${m.text}`)
      .join("\n");

    const raw = await askGemini(FEEDBACK_PROMPT, [
      { role: "user", text: `Role: ${session.role}\n\n${transcript}` },
    ]);

    const clean = raw.replace(/```json|```/g, "").trim();
    let report;
    try {
      report = JSON.parse(clean);
    } catch {
      return res.status(502).json({ message: "Could not read feedback. Please try again." });
    }

    sessions.delete(req.params.id);
    return res.json({ report });
  } catch (err) {
    return handleError(err, res);
  }
});

module.exports = router;