function AppHeader({ user, onLogout }) {
  return (
    <header className="app-header">
      <div>
        <h1>NeoHire</h1>
        <p>Intelligent Internship & Placement Tracker</p>
      </div>
      <div className="header-actions">
        <span className="user-badge">{user ? `Signed in as ${user.name}` : "Not signed in"}</span>
        {user && <button className="secondary-btn" onClick={onLogout}>Logout</button>}
      </div>
    </header>
  );
}

export default AppHeader;