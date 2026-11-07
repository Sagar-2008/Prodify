import { API } from "../api/client";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Auth.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", {
        email,
        password,
      });
      localStorage.setItem("email", email); // IMPORTANT
      setError("");
      navigate("/verify-otp");
    } catch (err) {
      setError(err.response?.data?.message || (err.request
        ? "Could not reach the API. If this is a free deployment, it may be waking up; try again shortly."
        : "Signup failed. Check the form and try again."));
    }
  };

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/"><span className="auth-brand-mark"><i /></span><span><strong>ZENKAI</strong><small>PERSONAL OS</small></span></Link>
      <main className="auth-main">
        <section className="auth-story">
          <span className="auth-eyebrow">A NEW CHAPTER FOR PRODIFY</span>
          <h1>Build your next level, one day at a time.</h1>
          <p>Bring focus, goals, habits, and learning into one calm place. Start with what matters today.</p>
          <div className="auth-modules"><span>01 <i /> Quest board</span><span>02 <i /> Time chamber</span><span>03 <i /> Training log</span></div>
          <div className="auth-story-sigil"><span>✦</span></div>
        </section>
        <div className="auth-card">
          <span className="auth-form-kicker">START YOUR JOURNEY</span>
          <h2>Create your account</h2>
          <p className="auth-sub">Make space for the work you want to do.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="auth-btn" type="submit">
            Create account <span>→</span>
          </button>
        </form>
        {error && <p className="auth-error" role="alert">{error}</p>}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        </div>
      </main>
      <Link className="auth-home-link" to="/">← Back to ZENKAI OS</Link>
    </div>
  );
}
