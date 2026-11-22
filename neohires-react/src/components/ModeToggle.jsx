function ModeToggle({ mode, setMode }) {
  return (
    <section id="mode-toggle">
      <button
        className={`toggle-btn ${mode === "internships" ? "active" : ""}`}
        onClick={() => setMode("internships")}
      >
        Internships
      </button>
      <button
        className={`toggle-btn ${mode === "hackathons" ? "active" : ""}`}
        onClick={() => setMode("hackathons")}
      >
        Hackathons
      </button>
    </section>
  );
}

export default ModeToggle;