import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  // ✅ Auto-redirect logged-in users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSignup = () => navigate("/signup");
  const handleLogin = () => navigate("/login");

  const handleWatchDemo = () => {
    console.log("Opening demo video...");
  };

  return (
    <div className="landing">
      <nav className="nav">
        <h2 className="logo">Prodify</h2>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it Works</a>
          <a href="#testimonials">Reviews</a>
          <button className="btn-secondary" onClick={handleLogin}>
            Login
          </button>
          <button className="btn-primary" onClick={handleSignup}>
            Get Started
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          🎯 Trusted by 10,000+ students worldwide
        </div>
        <h1>Build habits. Master focus.</h1>
        <p className="hero-sub">
          Prodify helps students build consistency, stay focused, and visualize
          real academic progress — without burnout.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={handleSignup}>
            Create Free Account
          </button>
          <button className="btn-secondary" onClick={handleWatchDemo}>
            Watch Demo
          </button>
        </div>

        <p className="hero-note">
          Designed for deep work • Calm UI • Habit mastery system
        </p>

        <div className="hero-stats">
          <div className="stat">
            <h3>2.5M+</h3>
            <p>Focus hours logged</p>
          </div>
          <div className="stat">
            <h3>87%</h3>
            <p>Improved GPA</p>
          </div>
          <div className="stat">
            <h3>4.9/5</h3>
            <p>Student rating</p>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <h2 className="section-title">Everything you need to succeed</h2>
        <div className="features-grid">
          <div className="card">
            <div className="card-icon">🎯</div>
            <h3>Habit Mastery System</h3>
            <p>
              Go beyond streaks. Progress through mastery levels like Rookie,
              Skilled, Expert, and Master as you build lasting habits.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">⏱️</div>
            <h3>Deep Focus Sessions</h3>
            <p>
              Built-in Pomodoro timer with focus logging, ambient music, and
              real impact on your habit growth.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">📊</div>
            <h3>Visual Progress</h3>
            <p>
              Weekly insights, streak heatmaps, and focus trends that make your
              improvement crystal clear.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">🧠</div>
            <h3>Smart Scheduling</h3>
            <p>
              AI-powered task prioritization that adapts to your energy levels
              and helps you work on what matters most.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">🏆</div>
            <h3>Achievement System</h3>
            <p>
              Unlock badges and milestones as you hit study goals, keeping
              motivation high throughout the semester.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">📱</div>
            <h3>Cross-Platform Sync</h3>
            <p>
              Seamlessly switch between desktop and mobile. Your progress
              follows you everywhere you study.
            </p>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <h2>How Prodify Works</h2>
        <p className="section-subtitle">
          Three simple steps to transform your productivity
        </p>

        <div className="steps">
          <div className="step">
            <span>01</span>
            <h4>Create habits & goals</h4>
            <p>
              Define what you want to achieve and break it into manageable daily
              habits
            </p>
          </div>

          <div className="step">
            <span>02</span>
            <h4>Focus using deep work mode</h4>
            <p>
              Enter distraction-free sessions with timers, music, and progress
              tracking
            </p>
          </div>

          <div className="step">
            <span>03</span>
            <h4>Track mastery & progress</h4>
            <p>
              Watch your skills level up and celebrate milestones along the way
            </p>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <h2>Loved by students everywhere</h2>
        <div className="testimonial-grid">
          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>
              "Prodify helped me maintain a 3.8 GPA while working part-time. The
              habit system is a game-changer!"
            </p>
            <div className="author">
              <strong>Sarah Chen</strong>
              <span>CS Major, Stanford</span>
            </div>
          </div>

          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>
              "Finally, a productivity app that doesn't make me feel guilty. The
              mastery levels keep me motivated."
            </p>
            <div className="author">
              <strong>Marcus Thompson</strong>
              <span>Engineering, MIT</span>
            </div>
          </div>

          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>
              "I went from procrastinating everything to completing assignments
              days early. This app changed my life."
            </p>
            <div className="author">
              <strong>Emily Rodriguez</strong>
              <span>Pre-Med, UCLA</span>
            </div>
          </div>
        </div>
      </section>

      <section className="comparison">
        <h2>Why choose Prodify?</h2>
        <div className="comparison-table">
          <div className="comparison-row header">
            <div></div>
            <div>Other Apps</div>
            <div className="highlight">Prodify</div>
          </div>

          <div className="comparison-row">
            <div>Habit tracking</div>
            <div>✓</div>
            <div>✓</div>
          </div>

          <div className="comparison-row">
            <div>Focus timer</div>
            <div>✓</div>
            <div>✓</div>
          </div>

          <div className="comparison-row">
            <div>Mastery progression system</div>
            <div>✗</div>
            <div>✓</div>
          </div>

          <div className="comparison-row">
            <div>Student-optimized design</div>
            <div>✗</div>
            <div>✓</div>
          </div>

          <div className="comparison-row">
            <div>Burnout prevention tools</div>
            <div>✗</div>
            <div>✓</div>
          </div>

          <div className="comparison-row">
            <div>Free tier available</div>
            <div>Limited</div>
            <div>Full access</div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to take control of your productivity?</h2>
        <p>Start building habits that last — one focused session at a time.</p>
        <button className="btn-primary btn-large" onClick={handleSignup}>
          Start with Prodify — It's Free
        </button>
        <p className="cta-note">
          No credit card required • 100% free forever plan
        </p>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="logo">Prodify</h3>
            <p>
              Empowering students to build better habits and achieve academic
              excellence.
            </p>
          </div>

          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <a href="#">Pricing</a>
            <a href="#">FAQ</a>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Prodify · Student Capstone Project
        </div>
      </footer>
    </div>
  );
}
