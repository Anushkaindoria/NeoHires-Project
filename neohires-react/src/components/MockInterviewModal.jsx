import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { startMockInterview, sendMockAnswer, endMockInterview } from "../services/api";

const CSS = `
.mim-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(3px);
  z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.mim-box { position: relative; background: #fff; color: #1f2937; border-radius: 16px; padding: 24px;
  width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,0.3); text-align: left; }
.mim-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border: none; border-radius: 50%;
  background: #f3f4f6; color: #4b5563; font-size: 18px; cursor: pointer; }
.mim-title { margin: 0 32px 4px 0; font-size: 20px; font-weight: 700; color: #111827; }
.mim-sub { margin: 0 0 14px; font-size: 14px; color: #6b7280; }
.mim-timer { font-weight: 700; color: #2563eb; margin-bottom: 8px; }
.mim-chat { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding: 4px 0; }
.mim-msg { padding: 10px 12px; border-radius: 12px; font-size: 14px; line-height: 1.5; max-width: 85%; }
.mim-bot { background: #eff6ff; color: #1e3a8a; align-self: flex-start; }
.mim-user { background: #f3f4f6; color: #111827; align-self: flex-end; }
.mim-input { width: 100%; box-sizing: border-box; margin-top: 12px; padding: 10px; border: 1px solid #cbd5e1;
  border-radius: 10px; font-size: 14px; font-family: inherit; resize: vertical; min-height: 80px; }
.mim-actions { display: flex; gap: 10px; margin-top: 12px; }
.mim-btn { border: none; border-radius: 10px; padding: 11px 18px; font-size: 14px; font-weight: 600; cursor: pointer; }
.mim-primary { background: #2563eb; color: #fff; flex: 1; }
.mim-primary:disabled { background: #93c5fd; cursor: not-allowed; }
.mim-ghost { background: #f3f4f6; color: #374151; }
.mim-error { margin: 12px 0 0; padding: 10px 12px; border-radius: 10px; background: #fef2f2; color: #b91c1c; font-size: 14px; }
.mim-scores { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 14px 0; }
.mim-score { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
.mim-score span { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280; }
.mim-score b { font-size: 24px; color: #2563eb; }
.mim-sec h4 { margin: 14px 0 6px; font-size: 14px; }
.mim-sec ul { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.5; }
`;

const fmt = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

function List({ title, items }) {
  if (!items || !items.length) return null;
  return (
    <div className="mim-sec">
      <h4>{title}</h4>
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

function MockInterviewModal({ internship, token, onClose }) {
  const role = internship.role || internship.name || "Software Engineer";
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [endsAt, setEndsAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!endsAt || report) return;
    const t = setInterval(() => setTimeLeft(Math.max(0, endsAt - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endsAt, report]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const timeUp = !!sessionId && timeLeft === 0;

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await startMockInterview(token, role);
      setSessionId(data.sessionId);
      setMessages([{ from: "bot", text: data.question }]);
      setTimeLeft(data.durationMs);
      setEndsAt(Date.now() + data.durationMs);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = answer.trim();
    if (!text) return setError("Please type your answer first.");
    setLoading(true);
    setError("");
    try {
      const data = await sendMockAnswer(token, sessionId, text);
      if (data.timeUp) {
        setTimeLeft(0);
      } else {
        setMessages((m) => [...m, { from: "user", text }, { from: "bot", text: data.question }]);
        setAnswer("");
        setFinished(!!data.finished);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await endMockInterview(token, sessionId);
      setReport(data.report);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="mim-overlay" onClick={onClose}>
      <style>{CSS}</style>
      <div className="mim-box" onClick={(e) => e.stopPropagation()}>
        <button className="mim-close" onClick={onClose} aria-label="Close">×</button>
        <h3 className="mim-title">Mock Interview — {role}</h3>

        {!sessionId && !report && (
          <>
            <p className="mim-sub">6 questions, 10 minutes. Answer in your own words, like a real interview.</p>
            <div className="mim-actions">
              <button className="mim-btn mim-primary" onClick={handleStart} disabled={loading}>
                {loading ? "Starting..." : "Start interview"}
              </button>
              <button className="mim-btn mim-ghost" onClick={onClose}>Close</button>
            </div>
          </>
        )}

        {sessionId && !report && (
          <>
            <div className="mim-timer">Time left: {fmt(timeLeft)}</div>
            <div className="mim-chat">
              {messages.map((m, i) => (
                <div key={i} className={`mim-msg ${m.from === "bot" ? "mim-bot" : "mim-user"}`}>{m.text}</div>
              ))}
              <div ref={bottomRef} />
            </div>

            {!finished && !timeUp && (
              <textarea
                className="mim-input"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            )}
            {timeUp && !finished && <p className="mim-sub">Time is up. Please end the interview.</p>}

            <div className="mim-actions">
              {!finished && !timeUp && (
                <button className="mim-btn mim-primary" onClick={handleSend} disabled={loading}>
                  {loading ? "Checking..." : "Send answer"}
                </button>
              )}
              <button
                className={`mim-btn ${finished || timeUp ? "mim-primary" : "mim-ghost"}`}
                onClick={handleEnd}
                disabled={loading}
              >
                End interview
              </button>
            </div>
          </>
        )}

        {report && (
          <>
            <p className="mim-sub">{report.summary}</p>
            <div className="mim-scores">
              <div className="mim-score"><span>Overall</span><b>{report.overallScore}/10</b></div>
              <div className="mim-score"><span>Communication</span><b>{report.communication}/10</b></div>
              <div className="mim-score"><span>Confidence</span><b>{report.confidence}/10</b></div>
              <div className="mim-score"><span>Relevance</span><b>{report.relevance}/10</b></div>
            </div>
            <List title="Strengths" items={report.strengths} />
            <List title="Weaknesses" items={report.weaknesses} />
            <List title="Tips" items={report.tips} />
            <div className="mim-actions">
              <button className="mim-btn mim-primary" onClick={onClose}>Close</button>
            </div>
          </>
        )}

        {error && <p className="mim-error">{error}</p>}
      </div>
    </div>,
    document.body
  );
}

export default MockInterviewModal;