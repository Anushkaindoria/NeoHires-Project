import { useState, useEffect } from "react";
import {
  fetchDashboard,
  updateApplicationStatus,
  deleteApplication,
  removeSavedListing,
} from "../services/api";

const STATUS_OPTIONS = ["Applied", "Interviewing", "Rejected", "Offer"];

function Dashboard({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = () => {
    fetchDashboard(token)
      .then((result) => setData(result))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(token, applicationId, newStatus);
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveApplication = async (applicationId) => {
    try {
      await deleteApplication(token, applicationId);
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnsave = async (savedId) => {
    try {
      await removeSavedListing(token, savedId);
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <p className="empty-state">{error}</p>;
  if (!data) return <p>Loading dashboard...</p>;

  const { summary, savedListings, applications } = data;

  return (
    <section className="dashboard-section">
      <h2>My Dashboard</h2>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Saved</span>
          <strong>{summary.savedCount}</strong>
        </div>
        <div className="summary-card">
          <span>Applied</span>
          <strong>{summary.appliedCount}</strong>
        </div>
        <div className="summary-card">
          <span>Interviewing</span>
          <strong>{summary.interviewingCount}</strong>
        </div>
        <div className="summary-card">
          <span>Rejected</span>
          <strong>{summary.rejectedCount}</strong>
        </div>
        <div className="summary-card">
          <span>Offers</span>
          <strong>{summary.offerCount}</strong>
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-panel">
          <h3>Saved Listings</h3>
          <div className="dashboard-list">
            {savedListings.length === 0 ? (
              <p className="empty-state">Nothing saved yet.</p>
            ) : (
              savedListings.map((item) => (
                <div className="dashboard-item" key={item._id}>
                  <div>
                    <strong>{item.listing?.company}</strong>
                    <p>{item.listing?.role || item.listing?.name}</p>
                  </div>
                  <div className="dashboard-item-actions">
                    <small>{item.listingType}</small>
                    <button
                      className="remove-btn"
                      onClick={() => handleUnsave(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <h3>Applications</h3>
          <div className="dashboard-list">
            {applications.length === 0 ? (
              <p className="empty-state">No applications tracked yet.</p>
            ) : (
              applications.map((item) => (
                <div className="dashboard-item dashboard-item-column" key={item._id}>
                  <strong>{item.listing?.company}</strong>
                  <p>{item.listing?.role || item.listing?.name}</p>

                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveApplication(item._id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;