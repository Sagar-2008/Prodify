import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [sessionDuration, setSessionDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(sessionDuration * 60);
  const [running, setRunning] = useState(false);
  const [isSession, setIsSession] = useState(true);
  const [taskName, setTaskName] = useState("Focus Session");
  const audioContextRef = useRef(null);
  const timerStartTimeRef = useRef(null);

  const playAlertSound = (frequency = 800, duration = 500) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);

      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();

        osc2.connect(gain2);
        gain2.connect(audioContext.destination);

        osc2.frequency.value = frequency + 200;
        osc2.type = "sine";

        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration / 1000,
        );

        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + duration / 1000);
      }, duration);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Timer interval that runs regardless of which page is active
  useEffect(() => {
    if (!running) {
      timerStartTimeRef.current = null;
      return;
    }

    let hasSessionEnded = false;

    // Store the timestamp when timer starts or resumes
    if (timerStartTimeRef.current === null) {
      timerStartTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - timerStartTimeRef.current) / 1000,
      );
      const initialTimeLeft =
        (isSession ? sessionDuration : breakDuration) * 60;
      const newTimeLeft = Math.max(0, initialTimeLeft - elapsedSeconds);

      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0 && !hasSessionEnded) {
        hasSessionEnded = true;
        timerStartTimeRef.current = null;
        playAlertSound(isSession ? 1000 : 600, 600);

        // ✅ SAVE ONLY FOCUS SESSION - using current state values
        if (isSession) {
          axios
            .post(
              "http://localhost:5000/pomodoro/session",
              {
                taskName,
                duration: sessionDuration,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            )
            .catch(console.error);
        }

        const newIsSession = !isSession;
        setIsSession(newIsSession);
        const newTime = (newIsSession ? sessionDuration : breakDuration) * 60;
        setTimeLeft(newTime);
        setRunning(false);
      }
    }, 100); // Check more frequently for accuracy

    return () => clearInterval(interval);
  }, [running, isSession, sessionDuration, breakDuration, taskName]);

  const value = {
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
    playAlertSound,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
};
