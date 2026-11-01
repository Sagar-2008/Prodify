import { useMemo, useState } from "react";
import { Check, Plus, Trash2, Zap } from "lucide-react";
import { useProductivity } from "../../context/ProductivityContext";
import CustomCategoryField from "../../components/CustomCategoryField";
import "../../styles/ProgressPages.css";

const filters = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All quests" },
  { id: "complete", label: "Completed" },
];

const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
  month: "short",
  day: "numeric",
});

export default function QuestBoard() {
  const { quests, today, addQuest, toggleQuest, deleteQuest } = useProductivity();
  const [filter, setFilter] = useState("today");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Study");
  const [xp, setXp] = useState(20);
  const [dueDate, setDueDate] = useState(today);
  const [actionError, setActionError] = useState("");

  const visibleQuests = useMemo(() => quests
    .filter((quest) => {
      if (filter === "today") return quest.dueDate === today && !quest.completed;
      if (filter === "upcoming") return quest.dueDate > today && !quest.completed;
      if (filter === "complete") return quest.completed;
      return true;
    })
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "") || b.createdAt - a.createdAt),
  [quests, filter, today]);

  const doneToday = quests.filter((quest) => quest.dueDate === today && quest.completed).length;
  const totalToday = quests.filter((quest) => quest.dueDate === today).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setActionError("");
    try {
      await addQuest({ title, category, xp, dueDate });
      setTitle("");
      setShowForm(false);
      setDueDate(today);
    } catch (error) { setActionError(error.response?.data?.message || "Could not save the quest."); }
  };

  return (
    <div className="progress-page quest-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow"><Zap size={14} /> QUEST BOARD</span>
          <h1>Turn intention into action.</h1>
          <p>Choose a mission, earn experience, and keep your momentum visible.</p>
        </div>
        <button className="action-button" onClick={() => setShowForm((open) => !open)}>
          <Plus size={17} /> New quest
        </button>
      </div>

      <section className="quest-summary panel-card">
        <div className="quest-summary-mark"><Zap size={20} /></div>
        <div className="quest-summary-copy">
          <span>DAILY MISSIONS</span>
          <strong>{doneToday} <small>/ {totalToday} complete</small></strong>
        </div>
        <div className="summary-progress" aria-label={`${doneToday} of ${totalToday} daily quests complete`}>
          <span style={{ width: `${totalToday ? (doneToday / totalToday) * 100 : 0}%` }} />
        </div>
        <span className="summary-date">{formatDate(today)}</span>
      </section>

      {showForm && (
        <form className="entry-form quest-form panel-card" onSubmit={handleSubmit}>
          <div className="entry-form-heading"><div><span className="eyebrow">ADD TO THE BOARD</span><h2>Set a quest</h2></div></div>
          <label className="field-wide">Quest name
            <input autoFocus maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Solve two array problems" required />
          </label>
          <div className="form-grid">
            <CustomCategoryField module="quest" label="Area" value={category} onChange={setCategory} />
            <label>Difficulty
              <select value={xp} onChange={(event) => setXp(Number(event.target.value))}>
                <option value={10}>Warm up · 10 XP</option>
                <option value={20}>Standard · 20 XP</option>
                <option value={40}>Boss quest · 40 XP</option>
              </select>
            </label>
            <label>Due date
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </label>
          </div>
          {actionError && <p className="form-error" role="alert">{actionError}</p>}
          <div className="form-actions">
            <button type="button" className="quiet-button" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="action-button"><Plus size={16} /> Add quest</button>
          </div>
        </form>
      )}

      <div className="filter-row" role="tablist" aria-label="Filter quests">
        {filters.map((item) => (
          <button key={item.id} role="tab" aria-selected={filter === item.id} className={filter === item.id ? "selected" : ""} onClick={() => setFilter(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="quest-list">
        {visibleQuests.map((quest) => (
          <article key={quest.id} className={`quest-row panel-card ${quest.completed ? "is-complete" : ""}`}>
            <button className="quest-check" aria-label={quest.completed ? `Reopen ${quest.title}` : `Complete ${quest.title}`} aria-pressed={quest.completed} onClick={() => toggleQuest(quest.id, !quest.completed).catch((error) => setActionError(error.response?.data?.message || "Could not update quest."))}>
              {quest.completed && <Check size={16} />}
            </button>
            <div className="quest-main">
              <strong>{quest.title}</strong>
              <div className="quest-meta"><span>{quest.category}</span><span>{formatDate(quest.dueDate)}</span></div>
            </div>
            <span className="xp-pill"><Zap size={13} /> {quest.xp} XP</span>
            <button className="icon-button delete-button" aria-label={`Delete ${quest.title}`} onClick={() => deleteQuest(quest.id).catch((error) => setActionError(error.response?.data?.message || "Could not delete quest."))}><Trash2 size={16} /></button>
          </article>
        ))}
        {!visibleQuests.length && (
          <div className="empty-state panel-card">
            <div className="empty-mark"><Check size={20} /></div>
            <h2>{filter === "today" ? "A clear board is a good start." : "Nothing here yet."}</h2>
            <p>{filter === "today" ? "Add one small mission to give today a direction." : "Quests you add will show up here."}</p>
            {filter === "today" && <button className="action-button" onClick={() => setShowForm(true)}><Plus size={16} /> Create your first quest</button>}
          </div>
        )}
      </div>
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      <p className="storage-note">Your quests sync to your Prodify account.</p>
    </div>
  );
}
