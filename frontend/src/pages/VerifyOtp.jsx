import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("email");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/auth/verify-otp", {
        email,
        otp,
      });

      alert("Account verified 🎉");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("http://localhost:5000/auth/resend-otp", {
        email,
      });

      alert("OTP resent 📩");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Verify OTP</h2>
        <p className="auth-sub">Enter the 6-digit code sent to your email</p>

        <form onSubmit={handleVerify}>
          <label>OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <button type="submit" className="btn-primary auth-btn">
            Verify
          </button>
        </form>

        <p className="auth-footer">
          Didn’t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            style={{
              background: "none",
              border: "none",
              color: "#a78bfa",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}
