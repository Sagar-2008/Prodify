import { useState } from "react";
import { ArrowDown, ArrowUp, Compass, Flag, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useProductivity } from "../../context/ProductivityContext";
import CustomCategoryField from "../../components/CustomCategoryField";
import "../../styles/ProgressPages.css";

export default function Goals() {
  const { goals, addGoal, adjustGoal, updateGoal, deleteGoal } = useProductivity();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("Career");
  const [kind, setKind] = useState("Goal");
  const [target, setTarget] = useState(5);
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setActionError("");
    try {
      await addGoal({ title, area, kind, target, dueDate });
      setTitle("");
      setShowForm(false);
    } catch (error) { setActionError(error.response?.data?.message || "Could not save the goal."); }
  };

  const startEdit = (goal) => {
    setEditingId(goal.id);
    setEditDraft({ title: goal.title, area: goal.area, kind: goal.kind, target: goal.target, dueDate: goal.dueDate || "" });
  };
  const saveEdit = async (event) => {
    event.preventDefault();
    setActionError("");
    try { await updateGoal(editingId, editDraft); setEditingId(null); setEditDraft(null); }
    catch (error) { setActionError(error.response?.data?.message || "Could not update the goal."); }
  };

  return (
    <div className="progress-page goals-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow"><Flag size={14} /> LONG GAME</span>
          <h1>Keep the bigger picture close.</h1>
          <p>Break your ambitions into visible steps. Update progress as you move.</p>
        </div>
        <button className="action-button" onClick={() => setShowForm((open) => !open)}><Plus size={17} /> Add a goal</button>
      </div>

      <section className="goals-intro panel-card">
        <div className="goals-orbit"><Compass size={23} /></div>
        <div><span className="eyebrow">YOUR SAGAS</span><h2>Progress, at your pace.</h2><p>Track projects and personal goals without turning them into another source of pressure.</p></div>
        <span className="goal-count">{goals.length} {goals.length === 1 ? "active path" : "active paths"}</span>
      </section>

      {showForm && (
        <form className="entry-form panel-card" onSubmit={handleSubmit}>
          <div className="entry-form-heading"><div><span className="eyebrow">START A NEW SAGA</span><h2>What are you working toward?</h2></div></div>
          <label className="field-wide">Goal or project name
            <input autoFocus maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Build my portfolio API" required />
          </label>
          <div className="form-grid">
            <label>Type
              <select value={kind} onChange={(event) => setKind(event.target.value)}><option>Goal</option><option>Project</option></select>
            </label>
            <CustomCategoryField module="goal" label="Area" value={area} onChange={setArea} />
            <label>Milestones
              <input type="number" min="1" max="100" value={target} onChange={(event) => setTarget(event.target.value)} required />
            </label>
            <label>Target date <span className="optional-label">optional</span>
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </label>
          </div>
          <p className="form-helper">Each milestone is one step you can mark complete. Edit the path any time.</p>
          {actionError && <p className="form-error" role="alert">{actionError}</p>}
          <div className="form-actions"><button type="button" className="quiet-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="action-button"><Plus size={16} /> Save path</button></div>
        </form>
      )}

      <div className="goal-grid">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.progress / goal.target) * 100));
          return (
            <article className="goal-card panel-card" key={goal.id}>
              <div className="goal-card-top"><span className="goal-tag">{goal.kind} · {goal.area}</span><div className="goal-card-actions"><button className="icon-button" aria-label={`Edit ${goal.title}`} onClick={() => editingId === goal.id ? (setEditingId(null), setEditDraft(null)) : startEdit(goal)}>{editingId === goal.id ? <X size={15} /> : <Pencil size={15} />}</button><button className="icon-button delete-button" aria-label={`Delete ${goal.title}`} onClick={() => deleteGoal(goal.id).catch((error) => setActionError(error.response?.data?.message || "Could not delete the goal."))}><Trash2 size={16} /></button></div></div>
              <h2>{goal.title}</h2>
              {editingId === goal.id && editDraft && <form className="goal-edit-form" onSubmit={saveEdit}>
                <label>Goal name<input maxLength={100} value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} required /></label>
                <div className="form-grid">
                  <label>Type<select value={editDraft.kind} onChange={(event) => setEditDraft({ ...editDraft, kind: event.target.value })}><option>Goal</option><option>Project</option></select></label>
                  <CustomCategoryField module="goal" label="Area" value={editDraft.area} onChange={(value) => setEditDraft({ ...editDraft, area: value })} />
                  <label>Milestones<input type="number" min="1" max="100000" value={editDraft.target} onChange={(event) => setEditDraft({ ...editDraft, target: event.target.value })} required /></label>
                  <label>Target date<input type="date" value={editDraft.dueDate} onChange={(event) => setEditDraft({ ...editDraft, dueDate: event.target.value })} /></label>
                </div>
                <button type="submit" className="quiet-button"><Save size={13} /> Save changes</button>
              </form>}
              <div className="goal-progress-label"><span>Milestones</span><strong>{goal.progress} <small>/ {goal.target}</small></strong></div>
              <div className="goal-progress-track"><span style={{ width: `${percent}%` }} /></div>
              <div className="goal-card-bottom"><span>{percent}% complete{goal.dueDate ? ` · target ${new Date(`${goal.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}</span><div className="goal-step-actions"><button className="icon-button" aria-label="Remove one milestone" disabled={!goal.progress} onClick={() => adjustGoal(goal.id, -1).catch((error) => setActionError(error.response?.data?.message || "Could not update the goal."))}><ArrowDown size={15} /></button><button className="icon-button" aria-label="Complete one milestone" disabled={goal.progress >= goal.target} onClick={() => adjustGoal(goal.id, 1).catch((error) => setActionError(error.response?.data?.message || "Could not update the goal."))}><ArrowUp size={15} /></button></div></div>
            </article>
          );
        })}
        {!goals.length && !showForm && (
          <div className="empty-state panel-card goals-empty">
            <div className="empty-mark"><Flag size={20} /></div><h2>Give your next chapter a shape.</h2><p>Add a goal or project, then break it into milestones you can actually finish.</p><button className="action-button" onClick={() => setShowForm(true)}><Plus size={16} /> Add your first goal</button>
          </div>
        )}
      </div>
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      <p className="storage-note">Your goals and milestones sync to your Prodify account.</p>
    </div>
  );
}
