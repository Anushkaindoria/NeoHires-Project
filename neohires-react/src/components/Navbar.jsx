function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="#" className="logo">NeoHire</a>
        <div className="nav-links">
          <a href="#app-section">Browse</a>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
        </div>
        <a href="#app-section" className="nav-cta">Get started</a>
      </div>
    </nav>
  );
}

export default Navbar;