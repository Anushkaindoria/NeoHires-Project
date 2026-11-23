import { useState } from "react";
import { createPortal } from "react-dom";
import { saveListing, setApplicationStatus } from "../services/api";
import ResumeCheckModal from "./ResumeCheckModal";
import MockInterviewModal from "./MockInterviewModal";

const POPUP_W = 340;
const POPUP_MAX_H = 320;

// Description ki shuruaat company ki lambi intro hoti hai, isliye role wale hisse se dikhao.
function getSummary(description) {
  if (!description) return "";
  const idx = description.search(
    /(What you['’]ll do|What you will do|Responsibilities|About the role|Role overview)/i
  );
  const text = idx > 0 ? description.slice(idx) : description;
  return text.length > 600 ? text.slice(0, 600).trimEnd() + "…" : text;
}

// Shown when a listing has no logo, or the logo image fails to load.
function LogoFallback({ company }) {
  const initial = (company || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="company-logo"
      role="img"
      aria-label={`${company} logo`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: "26px",
        fontWeight: 700,
        color: "#4b5563",
      }}
    >
      {initial}
    </div>
  );
}

function InternshipCard({ internship, token, isLoggedIn }) {
  const [feedback, setFeedback] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);
  const [pos, setPos] = useState(null); // null = popup hidden
  const [showResume, setShowResume] = useState(false);
  const [showMock, setShowMock] = useState(false);

  const handleSave = async () => {
    try {
      await saveListing(token, "internship", internship._id);
      setFeedback("Saved!");
    } catch (err) {
      setFeedback(err.message);
    }
  };

  const handleApply = async () => {
    try {
      await setApplicationStatus(token, "internship", internship._id, "Applied");
      setFeedback("Marked as Applied!");
    } catch (err) {
      setFeedback(err.message);
    }
  };

  const summary = getSummary(internship.description);

  const showPopup = (e) => {
    if (!summary || showResume) return;
    const r = e.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = r.right + 12;
    if (left + POPUP_W > vw - 8) left = r.left - POPUP_W - 12;
    if (left < 8) left = Math.max(8, Math.min(r.left, vw - POPUP_W - 8));

    let top = r.top;
    if (top + POPUP_MAX_H > vh - 8) top = Math.max(8, vh - POPUP_MAX_H - 8);

    setPos({ top, left });
  };

  const statusClass = `status-${internship.status.toLowerCase().replace(/\s+/g, "-")}`;
  const showLogo = internship.logo && !logoFailed;

  return (
    <div className="card" onMouseEnter={showPopup} onMouseLeave={() => setPos(null)}>
      <div className="card-header">
        {showLogo ? (
          <img
            className="company-logo"
            src={internship.logo}
            alt={`${internship.company} logo`}
            referrerPolicy="no-referrer"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <LogoFallback company={internship.company} />
        )}
        <span className="company-name">{internship.company}</span>
      </div>
      <p><strong>Role:</strong> {internship.role}</p>
      <p><strong>Type:</strong> {internship.type}</p>
      <p><strong>Eligibility:</strong> {internship.eligibility}</p>
      <p className={statusClass}>{internship.status}</p>

      {isLoggedIn ? (
        <>
          <a href={internship.applyLink} target="_blank" rel="noreferrer">
            <button className="apply-btn" onClick={handleApply}>Apply Now</button>
          </a>
          <button className="save-btn" onClick={handleSave}>Save</button>
          {feedback && <p>{feedback}</p>}
        </>
      ) : (
        <p className="empty-state">Log in to save or track this listing.</p>
      )}

      <button
        className="save-btn"
        onClick={() => {
          setPos(null);
          setShowResume(true);
        }}
      >
        Check my resume
      </button>

            {isLoggedIn && (
        <button
          className="save-btn"
          onClick={() => {
            setPos(null);
            setShowMock(true);
          }}
        >
          Mock Interview
        </button>
      )}

      {showResume && (
        <ResumeCheckModal internship={internship} onClose={() => setShowResume(false)} />
      )}

      {showMock && (
        <MockInterviewModal
          internship={internship}
          token={token}
          onClose={() => setShowMock(false)}
        />
      )}

      {pos &&
        !showResume &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: POPUP_W,
              maxHeight: POPUP_MAX_H,
              overflow: "hidden",
              padding: "14px 16px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
              fontSize: 14,
              lineHeight: 1.5,
              color: "#374151",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            <strong>{internship.company} · About this role</strong>
            <p style={{ margin: "6px 0 0" }}>{summary}</p>
          </div>,
          document.body
        )}
    </div>
  );
}

export default InternshipCard;