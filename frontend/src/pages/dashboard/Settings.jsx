import { useEffect, useState } from "react";
import { Flame, ImagePlus, RotateCcw, Save, Settings2, Sparkles, Trash2, Zap } from "lucide-react";
import { useProductivity } from "../../context/ProductivityContext";
import { PALETTE_PRESETS } from "../../config/personalization";
import "../../styles/ProgressPages.css";

const DEFAULT_RANKS = ["Earthling", "Saiyan", "Super Saiyan", "Ascended Saiyan", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan God", "Ultra Instinct"];
const defaultSettings = () => ({ xpPerLevel: 100, xpMultiplier: 1, focusXp: 25, trainingXpPerHour: 60, solvedBonus: 20, rankNames: DEFAULT_RANKS });
export default function Settings() {
  const { settings, profile, posterUrl, power, saveSettings, saveTheme, saveArtwork, removeArtwork } = useProductivity();
  const [form, setForm] = useState(defaultSettings);
  const [rankText, setRankText] = useState(DEFAULT_RANKS.join("\n"));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [appearanceMessage, setAppearanceMessage] = useState("");
  const [appearanceError, setAppearanceError] = useState("");
  const [appearanceSaving, setAppearanceSaving] = useState(false);

  useEffect(() => {
    const next = { ...defaultSettings(), ...settings };
    setForm(next);
    setRankText((next.rankNames || DEFAULT_RANKS).join("\n"));
  }, [settings]);

  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    const ranks = rankText.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
    if (ranks.length < 4 || ranks.length > 16) { setError("Add between 4 and 16 rank names."); return; }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await saveSettings({ ...form, rankNames: ranks });
      setMessage("Your Saiyan progression profile is saved to your account.");
    } catch (saveError) { setError(saveError.response?.data?.message || "Could not save these settings."); }
    finally { setSaving(false); }
  };

  const reset = () => { setForm(defaultSettings()); setRankText(DEFAULT_RANKS.join("\n")); setMessage(""); setError(""); };

  const chooseTheme = async (theme) => {
    setAppearanceSaving(true);
    setAppearanceError("");
    setAppearanceMessage("");
    try { await saveTheme(theme); setAppearanceMessage("Palette saved to your account."); }
    catch (saveError) { setAppearanceError(saveError.response?.data?.message || "Could not save this palette."); }
    finally { setAppearanceSaving(false); }
  };

  const handleArtwork = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 3 * 1024 * 1024) {
      setAppearanceError("Choose a PNG, JPEG, WebP, or GIF image under 3 MB.");
      return;
    }
    setAppearanceSaving(true);
    setAppearanceError("");
    setAppearanceMessage("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await saveArtwork(reader.result, file.name);
        setAppearanceMessage("Your character poster is saved to your account.");
      } catch (saveError) { setAppearanceError(saveError.response?.data?.message || "Could not save this image."); }
      finally { setAppearanceSaving(false); }
    };
    reader.onerror = () => { setAppearanceError("Could not read that image file."); setAppearanceSaving(false); };
    reader.readAsDataURL(file);
  };

  const handleRemoveArtwork = async () => {
    setAppearanceSaving(true);
    setAppearanceError("");
    setAppearanceMessage("");
    try { await removeArtwork(); setAppearanceMessage("Character poster removed."); }
    catch (removeError) { setAppearanceError(removeError.response?.data?.message || "Could not remove this image."); }
    finally { setAppearanceSaving(false); }
  };

  return <div className="progress-page settings-page">
    <div className="page-heading">
      <div><span className="eyebrow"><Settings2 size={14} /> YOUR SYSTEM</span><h1>Make progress feel like yours.</h1><p>Shape your power curve and choose the transformation names that keep you moving.</p></div>
    </div>

    <section className="power-profile-summary panel-card">
      <div className="profile-emblem"><Flame size={21} /></div>
      <div className="profile-summary-copy"><span>YOUR CURRENT SAIYAN PROFILE</span><strong>{power?.rank || "Earthling"} <small>· Level {power?.level || 1}</small></strong><p>Power level <b>{String(power?.powerLevel ?? 1).padStart(6, "0")}</b> · {Number(power?.totalXp || 0).toLocaleString()} total XP</p>{power?.nextRank && <><p className="profile-next-form">{Number(power.xpToNextRank).toLocaleString()} XP to {power.nextRank} · level {power.nextRankLevel} · {Math.round(power.rankProgress)}%</p><div className="profile-rank-track"><span style={{ width: `${power.rankProgress}%` }} /></div></>}</div>
      <div className="profile-xp"><Zap size={15} /><strong>{power?.xpToNextLevel ?? 100}</strong><span>XP to next level</span></div>
    </section>

    <section className="appearance-panel panel-card">
      <div className="entry-form-heading"><div><span className="eyebrow"><Sparkles size={13} /> APPEARANCE</span><h2>Choose your color palette.</h2><p>It follows you across the dashboard and saves to your account.</p></div></div>
      <div className="palette-grid" role="group" aria-label="Color palette presets">
        {PALETTE_PRESETS.map((palette) => <button type="button" key={palette.id} className={`palette-choice ${profile.theme === palette.id ? "is-selected" : ""}`} aria-pressed={profile.theme === palette.id} onClick={() => chooseTheme(palette.id)} disabled={appearanceSaving}>
          <span className="palette-preview" style={{ "--palette-bg": palette.colors[0], "--palette-accent": palette.colors[1], "--palette-warm": palette.colors[2] }}><i /><i /><i /></span>
          <span className="palette-choice-copy"><strong>{palette.name}</strong><small>{palette.detail}</small></span>
          {profile.theme === palette.id && <span className="palette-current">CURRENT</span>}
        </button>)}
      </div>

      <div className="poster-section">
        <div className="poster-preview" aria-label="Favorite character poster preview">
          {posterUrl ? <img src={posterUrl} alt={`Favorite character poster${profile.posterName ? `: ${profile.posterName}` : ""}`} /> : <div className="poster-placeholder"><ImagePlus size={24} /><span>YOUR CHARACTER ART</span><small>A portrait or poster you love</small></div>}
        </div>
          <div className="poster-copy"><span className="eyebrow">MAKE THIS SPACE YOURS</span><h3>Your favorite character, on your dashboard.</h3><p>Upload a small poster or portrait. It appears in the top bar and stays private to your account.</p><div className="poster-actions"><input id="character-art-upload" className="visually-hidden-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleArtwork} disabled={appearanceSaving} /><label htmlFor="character-art-upload" className={`quiet-button poster-upload-button ${appearanceSaving ? "is-disabled" : ""}`}><ImagePlus size={14} /> {appearanceSaving ? "Saving…" : posterUrl ? "Replace image" : "Choose image"}</label>{posterUrl && <button type="button" className="quiet-button" onClick={handleRemoveArtwork} disabled={appearanceSaving}><Trash2 size={13} /> Remove</button>}</div><small className="poster-file-note">PNG, JPEG, WebP, or GIF · maximum 3 MB</small></div>
      </div>
      {appearanceError && <p className="form-error" role="alert">{appearanceError}</p>}
      {appearanceMessage && <p className="form-success" role="status">{appearanceMessage}</p>}
    </section>

    <form className="entry-form panel-card settings-form" onSubmit={handleSubmit}>
      <div className="entry-form-heading"><div><span className="eyebrow">POWER CURVE</span><h2>Choose how your training turns into power.</h2></div><Sparkles size={18} /></div>
      <div className="settings-fields">
        <label>XP per level<input type="number" min="25" max="2000" step="1" value={form.xpPerLevel} onChange={change("xpPerLevel")} required /><small>How much XP advances one level (25–2,000).</small></label>
        <label>Progression multiplier<input type="number" min="0.25" max="5" step="0.05" value={form.xpMultiplier} onChange={change("xpMultiplier")} required /><small>Multiplies earned XP (0.25×–5×).</small></label>
        <label>Focus session XP<input type="number" min="0" max="10000" step="1" value={form.focusXp} onChange={change("focusXp")} required /><small>XP for each recorded Pomodoro session.</small></label>
        <label>Training XP per hour<input type="number" min="0" max="10000" step="1" value={form.trainingXpPerHour} onChange={change("trainingXpPerHour")} required /><small>XP for logged deliberate practice time.</small></label>
        <label>Completed item bonus<input type="number" min="0" max="10000" step="1" value={form.solvedBonus} onChange={change("solvedBonus")} required /><small>Extra XP for each completed training item.</small></label>
      </div>
      <label className="rank-names-field">Transformation rank names <span>One rank per line, from beginner to strongest (4–16 names).</span>
        <textarea rows="8" maxLength="800" value={rankText} onChange={(event) => setRankText(event.target.value)} />
      </label>
      <p className="form-helper">Power level starts at 000001 and multiplies by 10 across each 10-level transformation tier. At the default 100 XP per level, Saiyan begins at level 11 (1,000 XP) and Super Saiyan at level 21 (2,000 XP). Your current next-form target and progress appear in the dashboard. Completed quests, focus sessions, training time, and completed training items contribute XP.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      <div className="form-actions settings-actions"><button type="button" className="quiet-button" onClick={reset}><RotateCcw size={13} /> Reset to defaults</button><button type="submit" className="action-button" disabled={saving}><Save size={15} /> {saving ? "Saving…" : "Save my profile"}</button></div>
    </form>
  </div>;
}
