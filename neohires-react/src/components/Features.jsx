function Features() {
  return (
    <section className="features" id="features">
      <h2>Built for how students actually search</h2>
      <div className="feature-grid">
        <div className="feature-card">
          <i className="fa-solid fa-magnifying-glass"></i>
          <h3>Smart search</h3>
          <p>Describe what you want in plain words and get matching results, not just keyword hits.</p>
        </div>
        <div className="feature-card">
          <i className="fa-solid fa-comments"></i>
          <h3>Per-listing assistant</h3>
          <p>Ask questions about a specific opportunity, or check how well your resume fits it.</p>
        </div>
        <div className="feature-card">
          <i className="fa-solid fa-bookmark"></i>
          <h3>Save & track</h3>
          <p>Bookmark listings and track your application status from applied to offer.</p>
        </div>
        <div className="feature-card">
          <i className="fa-solid fa-user-tie"></i>
          <h3>Mock HR interviews</h3>
          <p>Practice with a timed, AI-run interview built around the role you're applying for.</p>
        </div>
      </div>
    </section>
  );
}

export default Features;