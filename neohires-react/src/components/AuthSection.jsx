import { useState } from "react";
import { login, signup } from "../services/api";

function AuthSection({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const data =
        authMode === "login"
          ? await login(email, password)
          : await signup(name, email, password);

      setMessageType("success");
      setMessage(authMode === "login" ? "Logged in successfully!" : "Account created!");
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setMessageType("error");
      setMessage(err.message);
    }
  };

  return (
    <section id="auth-section" className="auth-section">
      <div className="auth-card">
        <div className="auth-tabs">
          <button type="button" className={`tab-btn ${authMode === "login" ? "active" : ""}`} onClick={() => { setAuthMode("login"); setMessage(""); }}>
            Login
          </button>
          <button type="button" className={`tab-btn ${authMode === "signup" ? "active" : ""}`} onClick={() => { setAuthMode("signup"); setMessage(""); }}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {authMode === "signup" && (
            <div className="field">
              <label htmlFor="name-input">Name</label>
              <input id="name-input" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div className="field">
            <label htmlFor="email-input">Email</label>
            <input id="email-input" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="password-input">Password</label>
            <input id="password-input" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="primary-btn">
            {authMode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        {message && <div className={`auth-message ${messageType}`}>{message}</div>}
      </div>
    </section>
  );
}

export default AuthSection;