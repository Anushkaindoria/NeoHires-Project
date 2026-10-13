function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <h2>How NeoHire works</h2>
      <div className="steps">
        <div className="step">
          <div className="step-mark">1</div>
          <h3>We track the sources</h3>
          <p>Company career pages and listing platforms are checked on a schedule, so new openings show up without anyone adding them by hand.</p>
        </div>
        <div className="step">
          <div className="step-mark">2</div>
          <h3>You find the right fit</h3>
          <p>Filter by month, role, or eligibility, or ask the built-in assistant what matches your profile.</p>
        </div>
        <div className="step">
          <div className="step-mark">3</div>
          <h3>Expired listings clear themselves</h3>
          <p>Once a deadline passes, the listing is removed automatically. What you see is always current.</p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;