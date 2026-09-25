import { useState, useEffect } from "react";
import { fetchDashboard } from "../services/api";

function Dashboard({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard(token)
      .then((result) => setData(result))
      .catch((err) => setError(err.message));
  }, [token]);

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
                  <small>{item.listingType}</small>
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
                  <small>{item.status}</small>
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