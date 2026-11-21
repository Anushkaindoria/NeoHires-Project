import { useState } from "react";
import { createPortal } from "react-dom";

// In dev (5173) the backend is on another port; after build it is the same server.
const API =
  import.meta.env.VITE_API_URL ||
  (window.location.port === "5173" ? "http://localhost:5000" : "");

const CSS = `
.rcm-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(3px);
  z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.rcm-box { position: relative; background: #fff; color: #1f2937; border-radius: 16px; padding: 28px;
  width: 100%; max-width: 580px; max-height: 88vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,0.3);
  font-family: inherit; text-align: left; }
.rcm-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border: none; border-radius: 50%;
  background: #f3f4f6; color: #4b5563; font-size: 18px; line-height: 1; cursor: pointer; }
.rcm-close:hover { background: #e5e7eb; }
.rcm-title { margin: 0 32px 4px 0; font-size: 20px; font-weight: 700; color: #111827; }
.rcm-sub { margin: 0 0 18px; font-size: 14px; color: #6b7280; }
.rcm-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  border: 2px dashed #cbd5e1; border-radius: 12px; padding: 22px 16px; background: #f8fafc; cursor: pointer;
  text-align: center; font-size: 14px; color: #475569; transition: border-color .15s, background .15s; }
.rcm-drop:hover { border-color: #2563eb; background: #eff6ff; }
.rcm-drop strong { color: #1d4ed8; }
.rcm-file { font-weight: 600; color: #111827; word-break: break-all; }
.rcm-actions { display: flex; gap: 10px; margin-top: 14px; }
.rcm-btn { border: none; border-radius: 10px; padding: 11px 18px; font-size: 14px; font-weight: 600; cursor: pointer; }
.rcm-btn-primary { background: #2563eb; color: #fff; flex: 1; }
.rcm-btn-primary:hover { background: #1d4ed8; }
.rcm-btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
.rcm-btn-ghost { background: #f3f4f6; color: #374151; }
.rcm-btn-ghost:hover { background: #e5e7eb; }
.rcm-error { margin: 14px 0 0; padding: 10px 12px; border-radius: 10px; background: #fef2f2; color: #b91c1c; font-size: 14px; }
.rcm-notice { margin: 18px 0 0; padding: 10px 12px; border-radius: 10px; background: #fffbeb; color: #92400e; font-size: 13px; line-height: 1.5; }
.rcm-meters { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0 6px; }
.rcm-meter { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
.rcm-meter-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; }
.rcm-meter-value { margin: 4px 0 8px; font-size: 28px; font-weight: 800; }
.rcm-bar { height: 8px; border-radius: 99px; background: #e5e7eb; overflow: hidden; }
.rcm-fill { height: 100%; border-radius: 99px; transition: width .4s ease; }
.rcm-section { margin-top: 18px; }
.rcm-section h4 { margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #111827; }
.rcm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.rcm-chip { padding: 4px 10px; border-radius: 99px; font-size: 13px; font-weight: 600; }
.rcm-chip.ok { background: #dcfce7; color: #166534; }
.rcm-chip.bad { background: #fee2e2; color: #991b1b; }
.rcm-none { font-size: 13px; color: #6b7280; margin: 0; }
.rcm-tips { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.rcm-tips li { padding: 10px 12px; border-radius: 10px; background: #f8fafc; border-left: 3px solid #2563eb;
  font-size: 14px; line-height: 1.5; color: #374151; }
@media (max-width: 480px) { .rcm-meters { grid-template-columns: 1fr; } .rcm-box { padding: 20px; } }
`;

const colorFor = (n) => (n >= 70 ? "#16a34a" : n >= 40 ? "#d97706" : "#dc2626");

function Meter({ label, value, suffix }) {
  const hasValue = typeof value === "number";
  return (
    <div className="rcm-meter">
      <div className="rcm-meter-label">{label}</div>
      <div className="rcm-meter-value" style={{ color: hasValue ? colorFor(value) : "#9ca3af" }}>
        {hasValue ? `${value}${suffix}` : "N/A"}
      </div>
      <div className="rcm-bar">
        <div
          className="rcm-fill"
          style={{ width: `${hasValue ? value : 0}%`, background: hasValue ? colorFor(value) : "#d1d5db" }}
        />
      </div>
    </div>
  );
}

function Chips({ items, kind, emptyText }) {
  if (!items.length) return <p className="rcm-none">{emptyText}</p>;
  return (
    <div className="rcm-chips">
      {items.map((s) => (
        <span key={s} className={`rcm-chip ${kind}`}>{s}</span>
      ))}
    </div>
  );
}

function ResumeCheckModal({ internship, onClose }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    if (!file) return setError("Please select your resume first.");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("resume", file);
      const res = await fetch(`${API}/api/resume/analyze/${internship._id}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resume check failed.");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const skills = result?.skills || { matched: [], missing: [] };
  const keywords = result?.keywords || { matched: [], missing: [] };
  const hasSkills = skills.matched.length + skills.missing.length > 0;
  const hasKeywords = keywords.matched.length + keywords.missing.length > 0;

  return createPortal(
    <div className="rcm-overlay" onClick={onClose}>
      <style>{CSS}</style>
      <div className="rcm-box" onClick={(e) => e.stopPropagation()}>
        <button className="rcm-close" onClick={onClose} aria-label="Close">×</button>

        <h3 className="rcm-title">
          {internship.company} — {internship.role || internship.name}
        </h3>
        <p className="rcm-sub">Upload your resume and we will check it against this internship.</p>

        <label className="rcm-drop">
          <input
            type="file"
            accept=".pdf,.txt"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          {file ? (
            <span className="rcm-file">{file.name}</span>
          ) : (
            <span><strong>Click to choose a file</strong> (PDF or TXT, max 5 MB)</span>
          )}
        </label>

        <div className="rcm-actions">
          <button className="rcm-btn rcm-btn-primary" onClick={check} disabled={loading}>
            {loading ? "Checking..." : "Check resume"}
          </button>
          <button className="rcm-btn rcm-btn-ghost" onClick={onClose}>Close</button>
        </div>

        {error && <p className="rcm-error">{error}</p>}

        {result && (
          <>
            {result.dataQuality === "none" && (
              <p className="rcm-notice">
                This listing has no job description, so we can only compare your resume with the job title.
                Open the Apply link to read the full posting.
              </p>
            )}
            {result.dataQuality === "limited" && (
              <p className="rcm-notice">This listing is short, so the match may not be very accurate.</p>
            )}

            <div className="rcm-meters">
              <Meter label="Match with this role" value={result.matchPercent} suffix="%" />
              <Meter label="Resume score" value={result.resumeScore} suffix="/100" />
            </div>

            {hasSkills && (
              <>
                <div className="rcm-section">
                  <h4>Skills you have that this role wants</h4>
                  <Chips items={skills.matched} kind="ok" emptyText="None of the listed skills were found in your resume." />
                </div>
                <div className="rcm-section">
                  <h4>Skills missing from your resume</h4>
                  <Chips items={skills.missing} kind="bad" emptyText="Nothing missing. Nice!" />
                </div>
              </>
            )}

            {hasKeywords && (
              <>
                <div className="rcm-section">
                  <h4>Listing keywords found in your resume</h4>
                  <Chips items={keywords.matched} kind="ok" emptyText="None of the main keywords were found." />
                </div>
                <div className="rcm-section">
                  <h4>Listing keywords missing from your resume</h4>
                  <Chips items={keywords.missing} kind="bad" emptyText="Nothing missing. Nice!" />
                </div>
              </>
            )}

            {!hasSkills && !hasKeywords && (
              <p className="rcm-none" style={{ marginTop: 18 }}>
                We could not find specific skills or keywords in this listing.
              </p>
            )}

            <div className="rcm-section">
              <h4>What to improve</h4>
              <ul className="rcm-tips">
                {result.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default ResumeCheckModal;