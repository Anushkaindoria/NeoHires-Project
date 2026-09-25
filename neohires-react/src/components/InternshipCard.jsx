import { useState } from "react";
import { saveListing, setApplicationStatus } from "../services/api";

function InternshipCard({ internship, token, isLoggedIn }) {
  const [feedback, setFeedback] = useState("");

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

  const statusClass = `status-${internship.status.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="card">
      <div className="card-header">
        <img
          className="company-logo"
          src={internship.logo || "/assets/logos/default.png"}
          alt={`${internship.company} logo`}
          onError={(e) => { e.target.onerror = null; e.target.src = "/assets/logos/default.png"; }}
        />
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
    </div>
  );
}

export default InternshipCard;