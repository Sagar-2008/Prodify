import { useEffect } from "react";
import { createElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowRight, AudioLines, BarChart3, BookOpenCheck, Check, CirclePlay, Compass, Sparkles, Swords, Timer, Zap } from "lucide-react";
import "../styles/Landing.css";

const modules = [
  { icon: Swords, name: "Quest board", description: "Turn priorities into small missions you can finish and learn from.", accent: "orange" },
  { icon: Compass, name: "Goals & projects", description: "Keep long-term plans visible and move them forward milestone by milestone.", accent: "blue" },
  { icon: Timer, name: "Time chamber", description: "Use focused work and intentional breaks to protect your attention.", accent: "violet" },
  { icon: Zap, name: "Training log", description: "Record DSA practice, learning sessions, and the problems you solve.", accent: "gold" },
  { icon: AudioLines, name: "Soundscape", description: "Choose an ambient mix to set the tone for a focused session.", accent: "teal" },
  { icon: BarChart3, name: "Habits & insights", description: "Notice your patterns and build a routine that works for you.", accent: "green" },
];

export default function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="landing-shell">
      <header className="landing-nav-wrap">
        <nav className="landing-nav">
          <a className="landing-brand" href="#top" aria-label="ZENKAI OS home"><span className="landing-brand-mark"><i /></span><span><strong>ZENKAI</strong><small>PERSONAL OS</small></span></a>
          <div className="landing-nav-links"><a href="#system">The system</a><a href="#method">How it works</a><Link to="/login">Sign in</Link><Link className="nav-cta" to="/signup">Build your system <ArrowRight size={14} /></Link></div>
        </nav>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="landing-hero-grid" />
          <div className="landing-hero-copy">
            <span className="landing-kicker"><span className="kicker-light" /> A PERSONAL OPERATING SYSTEM</span>
            <h1>Your next level<br />is <em>built daily.</em></h1>
            <p className="landing-lede">A calm command center for the work that matters: focus sessions, habits, learning, and the long game you are building.</p>
            <div className="landing-hero-actions"><Link className="landing-primary" to="/signup">Start your training arc <ArrowRight size={16} /></Link><a className="landing-secondary" href="#system"><span><ArrowDown size={15} /></span> Explore the system</a></div>
            <div className="landing-principles"><span><Check size={13} /> Built around real actions</span><i /><span><Check size={13} /> Progress stays yours</span><i /><span><Check size={13} /> Start small, grow steadily</span></div>
          </div>

          <div className="landing-preview-wrap" aria-label="Sample command center preview">
            <div className="preview-orbit preview-orbit-a" /><div className="preview-orbit preview-orbit-b" />
            <div className="landing-preview">
              <div className="preview-topline"><div className="preview-brand"><span className="preview-brand-dot" /> ZENKAI OS</div><span className="preview-label">SAMPLE COMMAND CENTER</span></div>
              <div className="preview-welcome"><div><span>YOUR NEXT STEP</span><strong>Make today count.</strong></div><div className="preview-level"><span>POWER LEVEL</span><strong>000001 <small>PL</small></strong><i><b /></i></div></div>
              <div className="preview-stat-row"><div className="preview-stat"><span>FOCUS</span><strong>02<span> sessions</span></strong></div><div className="preview-stat"><span>QUESTS</span><strong>03<span> in progress</span></strong></div><div className="preview-stat"><span>TRAINING</span><strong>04<span> problems</span></strong></div></div>
              <div className="preview-quest-head"><span>TODAY’S QUESTS</span><span>VIEW BOARD ↗</span></div>
              <div className="preview-quest"><span className="preview-check"><Check size={11} /></span><span><strong>Review binary search patterns</strong><small>DSA DOJO</small></span><b>+20 XP</b></div>
              <div className="preview-quest preview-quest-pending"><span className="preview-check" /><span><strong>Ship one small project improvement</strong><small>BUILD</small></span><b>+30 XP</b></div>
              <div className="preview-focus"><span className="preview-focus-icon"><Timer size={15} /></span><span><small>TIME CHAMBER</small><strong>25:00</strong></span><span className="preview-play"><CirclePlay size={16} /></span></div>
              <div className="preview-footnote">Illustrative preview · Your dashboard reflects your own activity.</div>
            </div>
          </div>
          <div className="hero-bottom-mark"><span>01</span><i /> A SYSTEM FOR STEADY PROGRESS</div>
        </section>

        <section className="landing-section system-section" id="system">
          <div className="section-intro"><div><span className="landing-kicker"><Sparkles size={13} /> ONE PLACE. YOUR WHOLE ARC.</span><h2>Tools for the <em>work in front of you.</em></h2></div><p>Build your own rhythm with a connected set of practical tools. Use what helps, leave what does not.</p></div>
          <div className="module-grid">
            {modules.map(({ icon, name, description, accent }, index) => <article className={`module-card accent-${accent}`} key={name}><div className="module-card-top"><span className="module-icon">{createElement(icon, { size: 19 })}</span><span className="module-number">0{index + 1}</span></div><h3>{name}</h3><p>{description}</p><span className="module-line" /></article>)}
          </div>
        </section>

        <section className="landing-section method-section" id="method">
          <div className="method-heading"><span className="landing-kicker">THE ZENKAI LOOP</span><h2>Make progress<br /><em>feel possible.</em></h2><p>No grand reset required. Just a useful loop you can return to.</p></div>
          <div className="method-steps">
            <article><span className="step-index">01</span><div className="step-icon"><TargetLike /></div><h3>Choose your mission</h3><p>Pick a clear next action or a habit worth repeating.</p></article>
            <article><span className="step-index">02</span><div className="step-icon"><Timer size={19} /></div><h3>Protect your focus</h3><p>Work in a session, take a break, and return with intention.</p></article>
            <article><span className="step-index">03</span><div className="step-icon"><BookOpenCheck size={19} /></div><h3>See your growth</h3><p>Log the practice. Celebrate completion. Adjust your plan.</p></article>
          </div>
        </section>

        <section className="landing-cta">
          <div className="cta-sigil"><span>✦</span></div><div><span className="landing-kicker">YOUR JOURNEY. YOUR PACE.</span><h2>Start with one good next step.</h2><p>Set up your personal command center and shape it as you go.</p></div><Link className="landing-primary" to="/signup">Create your account <ArrowRight size={16} /></Link>
        </section>
      </main>

      <footer className="landing-footer"><a className="footer-brand" href="#top"><span className="landing-brand-mark"><i /></span><strong>ZENKAI OS</strong></a><span>Personal operating system · A new chapter for Prodify</span><div><Link to="/login">Sign in</Link><Link to="/signup">Get started</Link></div></footer>
    </div>
  );
}

function TargetLike() {
  return <span className="target-like"><span /><span /><i /></span>;
}
