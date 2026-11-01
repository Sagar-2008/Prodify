import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setError("");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || (err.request
        ? "Can't reach the Prodify API at localhost:5000. Start the backend in the backend folder, then retry."
        : "Login failed. Check your details and try again."));
    }
  };

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/"><span className="auth-brand-mark"><i /></span><span><strong>ZENKAI</strong><small>PERSONAL OS</small></span></Link>
      <main className="auth-main">
        <section className="auth-story">
          <span className="auth-eyebrow">PICK UP WHERE YOU LEFT OFF</span>
          <h1>Small steps still move you forward.</h1>
          <p>Your goals, training, and focus tools are ready when you are.</p>
          <div className="auth-modules"><span>01 <i /> Show up</span><span>02 <i /> Focus deeply</span><span>03 <i /> Keep growing</span></div>
          <div className="auth-story-sigil"><span>✦</span></div>
        </section>
        <div className="auth-card">
          <span className="auth-form-kicker">WELCOME BACK</span>
          <h2>Sign in to your space</h2>
          <p className="auth-sub">Continue building your personal system.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="auth-btn" type="submit">Sign in <span>→</span></button>
        </form>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="auth-footer">New to ZENKAI OS? <Link to="/signup">Create an account</Link></p>
      </div>
      </main>
      <Link className="auth-home-link" to="/">← Back to ZENKAI OS</Link>
    </div>
  );
}
