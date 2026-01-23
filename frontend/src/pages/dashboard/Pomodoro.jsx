import { useState, useEffect } from "react";
import "../../styles/Pomodoro.css";
import { usePomodoro } from "../../context/PomodoroContext";

export default function Pomodoro() {
  const {
    sessionDuration,
    setSessionDuration,
    breakDuration,
    setBreakDuration,
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

  // Update timeLeft when isSession changes (for reset/switch)
  useEffect(() => {
    if (!running) {
      setTimeLeft((isSession ? sessionDuration : breakDuration) * 60);
    }
  }, [isSession, sessionDuration, breakDuration, running, setTimeLeft]);

  // Load session and break durations from localStorage
  useEffect(() => {
    const savedSessionDuration = localStorage.getItem("sessionDuration");
    const savedBreakDuration = localStorage.getItem("breakDuration");
    if (savedSessionDuration) {
      setSessionDuration(parseInt(savedSessionDuration));
    }
    if (savedBreakDuration) {
      setBreakDuration(parseInt(savedBreakDuration));
    }
  }, [setSessionDuration, setBreakDuration]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleReset = () => {
    setRunning(false);
    setIsSession(true);
  };

  const handleSwitchMode = () => {
    setRunning(false);
    setIsSession(!isSession);
  };

  const handleSaveTask = () => {
    if (tempTaskName.trim()) {
      setTaskName(tempTaskName);
    }
    setEditingTask(false);
  };

  const handleSessionDurationChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    setSessionDuration(val);
    localStorage.setItem("sessionDuration", val);
  };

  const handleBreakDurationChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    setBreakDuration(val);
    localStorage.setItem("breakDuration", val);
  };

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-settings-toggle">
        <button
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="pomodoro-settings">
          <div className="setting-group">
            <label>Session Duration (minutes):</label>
            <input
              type="number"
              min="1"
              max="60"
              value={sessionDuration}
              onChange={handleSessionDurationChange}
              disabled={running}
            />
          </div>
          <div className="setting-group">
            <label>Break Duration (minutes):</label>
            <input
              type="number"
              min="1"
              max="30"
              value={breakDuration}
              onChange={handleBreakDurationChange}
              disabled={running}
            />
          </div>
          <button
            className="close-settings-btn"
            onClick={() => setShowSettings(false)}
          >
            Done
          </button>
        </div>
      )}

      <div className="pomodoro-mode-indicator">
        <span className={`mode ${isSession ? "session" : "break"}`}>
          {isSession ? "🎯 Focus Session" : "☕ Break Time"}
        </span>
      </div>

      <div className="pomodoro-timer">{formatTime(timeLeft)}</div>

      <div className="pomodoro-task-section">
        {editingTask ? (
          <div className="task-edit">
            <input
              type="text"
              value={tempTaskName}
              onChange={(e) => setTempTaskName(e.target.value)}
              placeholder="Enter task name"
              autoFocus
            />
            <button onClick={handleSaveTask}>Save</button>
            <button onClick={() => setEditingTask(false)}>Cancel</button>
          </div>
        ) : (
          <p
            className="pomodoro-task"
            onClick={() => {
              setEditingTask(true);
              setTempTaskName(taskName);
            }}
          >
            Current Task: {taskName}
            <span className="edit-hint"> (click to edit)</span>
          </p>
        )}
      </div>

      <div className="pomodoro-controls">
        <button onClick={() => setRunning(true)} disabled={running}>
          Start
        </button>
        <button onClick={() => setRunning(false)} disabled={!running}>
          Pause
        </button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleSwitchMode} disabled={running}>
          {isSession ? "Break" : "Focus"}
        </button>
      </div>
    </div>
  );
}
