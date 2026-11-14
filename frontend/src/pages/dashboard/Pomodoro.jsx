import { useRef, useState } from "react";
import { ImagePlus, RotateCcw, Settings2 } from "lucide-react";
import "../../styles/Pomodoro.css";
import { usePomodoro } from "../../context/PomodoroContext";

const BACKGROUND_STORAGE_KEY = "zenkai-pomodoro-background";

export default function Pomodoro() {
  const {
    sessionDuration,
    updateSessionDuration,
    breakDuration,
    updateBreakDuration,
    timeLeft,
    setTimeLeft,
    running,
    setRunning,
    isSession,
    setIsSession,
    taskName,
    setTaskName,
  } = usePomodoro();

  const [editingTask, setEditingTask] = useState(false);
  const [tempTaskName, setTempTaskName] = useState(taskName);
  const [showSettings, setShowSettings] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(() => {
    try {
      return localStorage.getItem(BACKGROUND_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [backgroundMessage, setBackgroundMessage] = useState("");
  const backgroundInput = useRef(null);

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const getButtonText = () => {
    if (running) return "Pause";
    const fullDuration = (isSession ? sessionDuration : breakDuration) * 60;
    return timeLeft === fullDuration ? "Start focus" : "Resume focus";
  };

  const handleReset = () => {
    setRunning(false);
    setIsSession(true);
    setTimeLeft(sessionDuration * 60);
  };

  const handleSwitchMode = () => {
    setRunning(false);
    const newIsSession = !isSession;
    setIsSession(newIsSession);
    setTimeLeft((newIsSession ? sessionDuration : breakDuration) * 60);
  };

  const handleSaveTask = () => {
    if (tempTaskName.trim()) {
      setTaskName(tempTaskName.trim());
    }
    setEditingTask(false);
  };

  const handleSessionDurationChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    updateSessionDuration(val);
  };

  const handleBreakDurationChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    updateBreakDuration(val);
  };

  const handleBackgroundChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBackgroundMessage("");

    if (file.size > 20 * 1024 * 1024) {
      setBackgroundMessage("Choose an image under 20 MB.");
      event.target.value = "";
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image editing is unavailable in this browser.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      const compressedImage = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("This image could not be saved."));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("This image could not be saved."));
          reader.readAsDataURL(blob);
        }, "image/webp", 0.82);
      });

      localStorage.setItem(BACKGROUND_STORAGE_KEY, compressedImage);
      setBackgroundImage(compressedImage);
      setBackgroundMessage("Background saved on this device.");
    } catch (error) {
      setBackgroundMessage(error.message || "Could not save this image. Try a smaller file.");
    } finally {
      event.target.value = "";
    }
  };

  const clearBackground = () => {
    try {
      localStorage.removeItem(BACKGROUND_STORAGE_KEY);
      setBackgroundImage("");
      setBackgroundMessage("Default background restored.");
    } catch {
      setBackgroundMessage("Could not remove this background.");
    }
  };

  return (
    <section
      className={`pomodoro-container ${backgroundImage ? "has-background" : ""}`}
      style={backgroundImage ? { "--pomodoro-background-image": `url("${backgroundImage}")` } : undefined}
    >
      <div className="pomodoro-toolbar">
        <div className="pomodoro-background-tools">
          <input
            ref={backgroundInput}
            className="pomodoro-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBackgroundChange}
            aria-label="Choose a Pomodoro background image"
          />
          <button className="pomodoro-appearance-button" type="button" onClick={() => backgroundInput.current?.click()}>
            <ImagePlus size={15} /> {backgroundImage ? "Change background" : "Add background"}
          </button>
          {backgroundImage && (
            <button className="pomodoro-clear-background" type="button" onClick={clearBackground}>
              Remove image
            </button>
          )}
          {backgroundMessage && <span className="pomodoro-background-message" role="status">{backgroundMessage}</span>}
        </div>

        <div className="pomodoro-settings-toggle">
          <button
            className="settings-btn"
            type="button"
            onClick={() => setShowSettings((visible) => !visible)}
            aria-label="Pomodoro settings"
            aria-expanded={showSettings}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="pomodoro-settings">
          <div className="setting-group">
            <label htmlFor="session-duration">Focus session</label>
            <div className="setting-input-wrap">
              <input
                id="session-duration"
                type="number"
                min="1"
                max="60"
                value={sessionDuration}
                onChange={handleSessionDurationChange}
                disabled={running}
              />
              <span>minutes</span>
            </div>
          </div>
          <div className="setting-group">
            <label htmlFor="break-duration">Break</label>
            <div className="setting-input-wrap">
              <input
                id="break-duration"
                type="number"
                min="1"
                max="30"
                value={breakDuration}
                onChange={handleBreakDurationChange}
                disabled={running}
              />
              <span>minutes</span>
            </div>
          </div>
          <button className="close-settings-btn" type="button" onClick={() => setShowSettings(false)}>
            Done
          </button>
        </div>
      )}

      <div className="pomodoro-content">
        <div className="pomodoro-kicker"><span /> YOUR FOCUS SPACE</div>

        <div className="pomodoro-mode-indicator">
          <span className={`mode ${isSession ? "session" : "break"}`}>
            {isSession ? "Focus session" : "Break time"}
          </span>
        </div>

        <div className="pomodoro-timer" role="timer" aria-label={`${formatTime(timeLeft)} remaining`}>
          {formatTime(timeLeft)}
        </div>

        <div className="pomodoro-task-section">
          {editingTask ? (
            <form className="task-edit" onSubmit={(event) => { event.preventDefault(); handleSaveTask(); }}>
              <input
                type="text"
                value={tempTaskName}
                onChange={(e) => setTempTaskName(e.target.value)}
                placeholder="Enter task name"
                aria-label="Current focus task"
                autoFocus
              />
              <button type="submit">Save</button>
              <button type="button" className="task-cancel" onClick={() => setEditingTask(false)}>Cancel</button>
            </form>
          ) : (
            <button
              className="pomodoro-task"
              type="button"
              onClick={() => {
                setEditingTask(true);
                setTempTaskName(taskName);
              }}
            >
              <span className="task-label">CURRENT TASK</span>
              <span className="task-name">{taskName || "Choose your next task"}</span>
              <span className="edit-hint">Edit</span>
            </button>
          )}
        </div>

        <div className="pomodoro-controls">
          <button className="pomodoro-primary-action" type="button" onClick={() => setRunning(!running)}>
            <span className={`pomodoro-play-mark ${running ? "is-running" : ""}`} />
            {running ? "Pause" : getButtonText()}
          </button>
          <button className="pomodoro-secondary-action" type="button" onClick={handleReset}>
            <RotateCcw size={15} /> Reset
          </button>
          <button className="pomodoro-secondary-action" type="button" onClick={handleSwitchMode} disabled={running}>
            {isSession ? "Take a break" : "Back to focus"}
          </button>
        </div>

        <p className="pomodoro-footnote">A little progress, one focused minute at a time.</p>
      </div>
    </section>
  );
}

