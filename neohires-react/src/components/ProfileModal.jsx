function ProfileModal({ user, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <div className="profile-modal-body">
          <span className="nav-user-avatar nav-user-avatar-xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
          </span>
          <h2>{user?.name}</h2>
          <p className="profile-modal-email">{user?.email || "No email on file"}</p>

          <div className="profile-modal-field">
            <span>Name</span>
            <strong>{user?.name}</strong>
          </div>
          <div className="profile-modal-field">
            <span>Email</span>
            <strong>{user?.email || "Not available"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;