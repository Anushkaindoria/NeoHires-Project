function Hero() {
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <h1>Every internship and hackathon worth applying to, in one place.</h1>
          <p className="hero-sub">NeoHire tracks openings across companies so you don't have to check ten tabs a day. New opportunities appear automatically. Expired ones disappear on their own.</p>
          <div className="hero-actions">
            <a href="#app-section" className="btn-primary">Browse opportunities</a>
            <a href="#how-it-works" className="btn-secondary">See how it works</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="stat-chip stat-chip-1">
            <span className="stat-number">500+</span>
            <span className="stat-label">live opportunities</span>
          </div>
          <div className="stat-chip stat-chip-2">
            <span className="stat-number">Daily</span>
            <span className="stat-label">auto-updated</span>
          </div>

          <div className="preview-card preview-card-back">
            <div className="preview-header">
              <div className="preview-logo">JP</div>
              <div>
                <p className="preview-company">JP Morgan</p>
                <p className="preview-role">Software Engineer Intern</p>
              </div>
            </div>
            <p className="preview-status status-upcoming">● Upcoming</p>
          </div>

          <div className="preview-card preview-card-front">
            <div className="preview-header">
              <div className="preview-logo">GO</div>
              <div>
                <p className="preview-company">Google</p>
                <p className="preview-role">GSoC 2026</p>
              </div>
            </div>
            <p className="preview-eligibility">2nd–3rd year · Open source</p>
            <p className="preview-status status-open">● Open</p>
            <button className="preview-apply">Apply now</button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Hero;