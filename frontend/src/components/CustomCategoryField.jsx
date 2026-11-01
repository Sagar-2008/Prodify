import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { useProductivity } from "../context/ProductivityContext";

const defaults = {
  quest: ["Study", "Build", "Career", "Health", "Personal"],
  goal: ["Career", "Study", "Health", "Personal", "Creative"],
  training: ["DSA", "Course", "Project", "Reading"],
};

export default function CustomCategoryField({ module, label, value, onChange }) {
  const { categories, addCategory } = useProductivity();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const options = [...new Set([...(defaults[module] || []), ...(categories[module] || []).map((item) => item.name), ...(value && ![...(defaults[module] || []), ...(categories[module] || []).map((item) => item.name)].includes(value) ? [value] : [])])];

  const save = async () => {
    const categoryName = name.trim();
    if (!categoryName) return;
    setSaving(true);
    setError("");
    try {
      await addCategory(module, categoryName);
      onChange(categoryName);
      setName("");
      setAdding(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not save this category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="custom-category-field">
      <label>{label}
        <select value={adding ? "__new__" : value} onChange={(event) => {
          if (event.target.value === "__new__") setAdding(true);
          else { setAdding(false); onChange(event.target.value); }
        }}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
          <option value="__new__">＋ Create a category…</option>
        </select>
      </label>
      {adding && <div className="custom-category-editor">
        <input autoFocus maxLength={64} value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); save(); } }} placeholder="Name your category" aria-label="New category name" />
        <button type="button" className="icon-button" disabled={saving || !name.trim()} onClick={save} aria-label="Save custom category"><Save size={14} /></button>
        <button type="button" className="icon-button" onClick={() => { setAdding(false); setError(""); }} aria-label="Cancel new category"><X size={14} /></button>
      </div>}
      {!adding && <button type="button" className="add-category-link" onClick={() => setAdding(true)}><Plus size={12} /> Add your own</button>}
      {error && <small className="category-error">{error}</small>}
    </div>
  );
}
