import { useState, useRef, useEffect } from "react";
import ProfileModal from "./ProfileModal";

function Navbar({ user, onGetStartedClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="#" className="logo">NeoHire</a>

        {!user && (
          <div className="nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#app-section">Browse</a>
          </div>
        )}

        {user ? (
          <div className="nav-dropdown-wrapper" ref={menuRef}>
            <button
              type="button"
              className="nav-user-trigger"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="nav-user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </span>
              <span className="nav-user-name">{user.name}</span>
              <span className={`nav-chevron ${menuOpen ? "nav-chevron-open" : ""}`}>▾</span>
            </button>

            {menuOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-header">
                  <span className="nav-user-avatar nav-user-avatar-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </span>
                  <div>
                    <p className="nav-dropdown-name">{user.name}</p>
                    <p className="nav-dropdown-email">{user.email || "No email on file"}</p>
                  </div>
                </div>

                <div className="nav-dropdown-divider" />

                <button
                  type="button"
                  className="nav-dropdown-item"
                  onClick={() => {
                    setShowProfileModal(true);
                    setMenuOpen(false);
                  }}
                >
                  View Profile
                </button>

                <button type="button" className="nav-dropdown-item nav-dropdown-item-disabled" disabled>
                  Profile Settings
                  <span className="coming-soon-tag">Coming soon</span>
                </button>

                <button type="button" className="nav-dropdown-item nav-dropdown-item-disabled" disabled>
                  Delete Account
                  <span className="coming-soon-tag">Coming soon</span>
                </button>

                <div className="nav-dropdown-divider" />

                <button
                  type="button"
                  className="nav-dropdown-item nav-dropdown-item-danger"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" className="nav-cta" onClick={onGetStartedClick}>
            Get started
          </button>
        )}
      </div>

      {showProfileModal && (
        <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
      )}
    </nav>
  );
}

export default Navbar;