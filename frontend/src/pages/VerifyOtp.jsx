import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("email");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/auth/verify-otp", {
        email,
        otp,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Check the code and try again.");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("http://localhost:5000/auth/resend-otp", {
        email,
      });

      setError("");
      setMessage("A new code has been sent.");
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.message || "Could not resend the code. Try again shortly.");
    }
  };

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/"><span className="auth-brand-mark"><i /></span><span><strong>ZENKAI</strong><small>PERSONAL OS</small></span></Link>
      <main className="auth-main auth-main-single">
        <section className="auth-story">
          <span className="auth-eyebrow">ONE LAST STEP</span>
          <h1>Make this space yours.</h1>
          <p>Verify your email to finish setting up your personal operating system.</p>
          <div className="auth-story-sigil"><span>✦</span></div>
        </section>
        <div className="auth-card">
          <span className="auth-form-kicker">EMAIL VERIFICATION</span>
          <h2>Check your inbox</h2>
          <p className="auth-sub">Enter the 6-digit code sent to {email || "your email address"}.</p>

        <form onSubmit={handleVerify}>
          <label>OTP</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="One-time verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <button type="submit" className="auth-btn">
            Verify email <span>→</span>
          </button>
        </form>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}

        <p className="auth-footer">
          Didn’t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            style={{
              background: "none",
              border: "none",
              color: "#f1b875",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Resend OTP
          </button>
        </p>
        </div>
      </main>
      <Link className="auth-home-link" to="/">← Back to ZENKAI OS</Link>
    </div>
  );
}
