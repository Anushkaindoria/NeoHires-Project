import { useState } from "react";
import { saveListing, setApplicationStatus } from "../services/api";

function HackathonCard({ hackathon, token, isLoggedIn }) {
  const [feedback, setFeedback] = useState("");

  const handleSave = async () => {
    try {
      await saveListing(token, "hackathon", hackathon._id);
      setFeedback("Saved!");
    } catch (err) {
      setFeedback(err.message);
    }
  };

  const handleApply = async () => {
    try {
      await setApplicationStatus(token, "hackathon", hackathon._id, "Applied");
      setFeedback("Marked as Applied!");
    } catch (err) {
      setFeedback(err.message);
    }
  };

  const statusClass = `status-${hackathon.status.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="card">
      <div className="card-header">
        <img
          className="company-logo"
          src={hackathon.logo || "/assets/logos/default.png"}
          alt={`${hackathon.company} logo`}
          onError={(e) => { e.target.onerror = null; e.target.src = "/assets/logos/default.png"; }}
        />
        <span className="company-name">{hackathon.company}</span>
      </div>
      <p><strong>Theme:</strong> {hackathon.theme}</p>
      <ul className="tech-stack">
        {hackathon.techStack.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
      <p className={statusClass}>{hackathon.status}</p>

      {isLoggedIn ? (
        <>
          <a href={hackathon.applyLink} target="_blank" rel="noreferrer">
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

export default HackathonCard;