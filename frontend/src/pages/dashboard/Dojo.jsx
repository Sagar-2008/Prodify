import { useMemo, useState } from "react";
import { BookOpenCheck, Check, Code2, Plus, Trash2 } from "lucide-react";
import { useProductivity } from "../../context/ProductivityContext";
import CustomCategoryField from "../../components/CustomCategoryField";
import "../../styles/ProgressPages.css";

export default function Dojo() {
  const { training: entries, today, addTraining, toggleSolved, deleteTraining } = useProductivity();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("DSA");
  const [minutes, setMinutes] = useState(30);
  const [solved, setSolved] = useState(false);
  const [actionError, setActionError] = useState("");

  const totals = useMemo(() => ({
    minutes: entries.reduce((sum, entry) => sum + (Number(entry.minutes) || 0), 0),
    solved: entries.filter((entry) => entry.solved).length,
    sessions: entries.length,
  }), [entries]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setActionError("");
    try {
      await addTraining({ title: title.trim(), type, minutes: Math.max(1, Number(minutes) || 1), solved, date: today });
      setTitle("");
      setMinutes(30);
      setSolved(false);
      setShowForm(false);
    } catch (error) { setActionError(error.response?.data?.message || "Could not save the training session."); }
  };

  return (
    <div className="progress-page dojo-page">
      <div className="page-heading">
        <div><span className="eyebrow"><Code2 size={14} /> TRAINING LOG</span><h1>Sharpen the skills you rely on.</h1><p>Keep a simple record of deliberate practice, projects, and problems solved.</p></div>
        <button className="action-button" onClick={() => setShowForm((open) => !open)}><Plus size={17} /> Log a session</button>
      </div>

      <div className="dojo-stats">
        <article className="dojo-stat panel-card"><span>Practice time</span><strong>{Math.floor(totals.minutes / 60)}<small>h</small> {totals.minutes % 60}<small>m</small></strong><p>Across {totals.sessions} logged {totals.sessions === 1 ? "session" : "sessions"}</p></article>
        <article className="dojo-stat panel-card"><span>Items completed</span><strong>{totals.solved}</strong><p>Marked complete in your training log</p></article>
        <article className="dojo-stat dojo-stat-feature panel-card"><BookOpenCheck size={19} /><span>Training arc</span><strong>One rep at a time.</strong><p>Progress builds from showing up consistently.</p></article>
      </div>

      {showForm && <form className="entry-form panel-card" onSubmit={handleSubmit}>
        <div className="entry-form-heading"><div><span className="eyebrow">RECORD A SESSION</span><h2>What did you work on?</h2></div></div>
        <label className="field-wide">Activity
          <input autoFocus maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Two pointers · Valid Palindrome" required />
        </label>
        <div className="form-grid">
          <CustomCategoryField module="training" label="Training area" value={type} onChange={(value) => { setType(value); setSolved(false); }} />
          <label>Time spent (minutes)<input type="number" min="1" max="720" value={minutes} onChange={(event) => setMinutes(event.target.value)} required /></label>
        </div>
        <label className="check-field"><input type="checkbox" checked={solved} onChange={(event) => setSolved(event.target.checked)} /> Mark this item complete</label>
        {actionError && <p className="form-error" role="alert">{actionError}</p>}
        <div className="form-actions"><button type="button" className="quiet-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="action-button"><Plus size={16} /> Save session</button></div>
      </form>}

      <section className="activity-section">
        <div className="section-heading"><div><span className="eyebrow">YOUR PRACTICE</span><h2>Recent sessions</h2></div><span>{entries.length} logged</span></div>
        <div className="activity-list">
          {entries.map((entry) => <article className="activity-row panel-card" key={entry.id}>
            <div className="activity-icon">{entry.type === "DSA" ? <Code2 size={18} /> : <BookOpenCheck size={18} />}</div>
            <div className="activity-main"><strong>{entry.title}</strong><span>{entry.type} · {new Date(`${entry.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span></div>
            <span className="duration-pill">{entry.minutes} min</span>
            <button className={`solved-button ${entry.solved ? "solved" : ""}`} onClick={() => toggleSolved(entry.id, !entry.solved).catch((error) => setActionError(error.response?.data?.message || "Could not update this session."))} aria-pressed={entry.solved}>{entry.solved ? <><Check size={14} /> Complete</> : "Mark complete"}</button>
            <button className="icon-button delete-button" onClick={() => deleteTraining(entry.id).catch((error) => setActionError(error.response?.data?.message || "Could not delete this session."))} aria-label={`Delete ${entry.title}`}><Trash2 size={16} /></button>
          </article>)}
          {!entries.length && <div className="empty-state panel-card"><div className="empty-mark"><Code2 size={20} /></div><h2>Your training record starts here.</h2><p>Log a study or build session to see your practice add up over time.</p><button className="action-button" onClick={() => setShowForm(true)}><Plus size={16} /> Log your first session</button></div>}
        </div>
      </section>
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      <p className="storage-note">Your training log syncs to your Prodify account.</p>
    </div>
  );
}
