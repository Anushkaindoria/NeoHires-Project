import AuthSection from "./AuthSection";

function AuthModal({ onClose, onAuthSuccess }) {
  // When login/signup succeeds inside the popup, pass the user data up to
  // App.jsx (so it knows someone logged in) AND close the popup right after.
  function handleAuthSuccess(userData, tokenData) {
    onAuthSuccess(userData, tokenData);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <AuthSection onAuthSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
}

export default AuthModal;