import React, { useState, useEffect } from "react";
import {
  getJournalByMonth,
  getJournalEntry,
  saveJournalEntry,
  deleteJournalEntry,
} from "../../api/journals.api";
import "../../styles/Journal.css";

export default function Journal() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalData, setModalData] = useState({
    title: "",
    content: "",
    mood: "neutral",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Fetch journal entries for current month
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const data = await getJournalByMonth(year, month);
        const entriesMap = {};
        data.forEach((entry) => {
          entriesMap[entry.entry_date] = entry;
        });
        setEntries(entriesMap);
      } catch (err) {
        console.error("Failed to fetch entries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [year, month]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleDateClick = async (day) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);

    if (entries[dateStr]) {
      // Load existing entry
      try {
        const entry = await getJournalEntry(entries[dateStr].id);
        setModalData({
          title: entry.title || "",
          content: entry.content || "",
          mood: entry.mood || "neutral",
        });
      } catch (err) {
        console.error("Failed to load entry:", err);
      }
    } else {
      // New entry
      setModalData({ title: "", content: "", mood: "neutral" });
    }

    setShowModal(true);
  };

  const handleSaveEntry = async () => {
    if (!selectedDate || !modalData.content.trim()) {
      alert("Please write something in your journal!");
      return;
    }

    try {
      const saved = await saveJournalEntry({
        entry_date: selectedDate,
        title: modalData.title || null,
        content: modalData.content,
        mood: modalData.mood,
      });

      // Update local entries with the returned id so future loads work
      setEntries({
        ...entries,
        [selectedDate]: {
          id: saved.id,
          entry_date: selectedDate,
          title: saved.title || modalData.title || null,
          content: saved.content || modalData.content,
          mood: saved.mood || modalData.mood || "neutral",
        },
      });

      setShowModal(false);
      setModalData({ title: "", content: "", mood: "neutral" });
    } catch (err) {
      alert("Failed to save entry: " + err.message);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedDate || !entries[selectedDate]) return;

    if (!confirm("Delete this journal entry?")) return;

    try {
      await deleteJournalEntry(entries[selectedDate].id);

      const newEntries = { ...entries };
      delete newEntries[selectedDate];
      setEntries(newEntries);

      setShowModal(false);
      setModalData({ title: "", content: "", mood: "neutral" });
    } catch (err) {
      alert("Failed to delete entry: " + err.message);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  if (loading && Object.keys(entries).length === 0) {
    return (
      <div className="journal-page loading">
        <div className="spinner"></div>
        <p>Loading your journal…</p>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <header className="journal-header">
        <h1>✨ My Journal</h1>
        <p>Capture your thoughts and feelings</p>
      </header>

      <div className="journal-stats">
        <div className="stat-card">
          <span className="stat-number">{Object.keys(entries).length}</span>
          <span className="stat-label">Entries</span>
        </div>
      </div>

      <section className="journal-calendar-section">
        {/* Month navigation */}
        <div className="month-nav">
          <button onClick={handlePrevMonth}>❮</button>
          <h2>
            {monthName} {year}
          </h2>
          <button onClick={handleNextMonth}>❯</button>
        </div>

        {/* Weekday headers */}
        <div className="weekday-row">
          {"SMTWTFS".split("").map((day, i) => (
            <div key={i} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="journal-calendar-grid">
          {days.map((day, index) => {
            if (day === null) {
              return (
                <div key={`empty-${index}`} className="day-card empty"></div>
              );
            }

            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasEntry = entries[dateStr];
            const entry = entries[dateStr];

            return (
              <div
                key={day}
                className={`day-card ${hasEntry ? "has-entry" : ""}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="day-num">{day}</div>
                {hasEntry ? (
                  <div className="entry-preview">
                    <span className="mood-emoji">
                      {entry.mood === "happy"
                        ? "😊"
                        : entry.mood === "sad"
                          ? "😢"
                          : entry.mood === "neutral"
                            ? "😐"
                            : entry.mood === "excited"
                              ? "🤩"
                              : "😌"}
                    </span>
                    <p className="entry-title">
                      {entry.title || "Journal Entry"}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="add-entry-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(day);
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div
          className="journal-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="journal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedDate &&
                  new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-content">
              {/* Mood selector */}
              <div className="mood-selector">
                <label>Mood</label>
                <div className="mood-options">
                  {[
                    { id: "happy", emoji: "😊", label: "Happy" },
                    { id: "sad", emoji: "😢", label: "Sad" },
                    { id: "neutral", emoji: "😐", label: "Neutral" },
                    { id: "excited", emoji: "🤩", label: "Excited" },
                    { id: "calm", emoji: "😌", label: "Calm" },
                  ].map((mood) => (
                    <button
                      key={mood.id}
                      className={`mood-btn ${modalData.mood === mood.id ? "active" : ""}`}
                      onClick={() =>
                        setModalData({ ...modalData, mood: mood.id })
                      }
                      title={mood.label}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                placeholder="Title (optional)"
                value={modalData.title}
                onChange={(e) =>
                  setModalData({ ...modalData, title: e.target.value })
                }
                className="journal-title-input"
              />

              {/* Content textarea */}
              <textarea
                placeholder="Write your thoughts here..."
                value={modalData.content}
                onChange={(e) =>
                  setModalData({ ...modalData, content: e.target.value })
                }
                className="journal-content-textarea"
              />

              {/* Actions */}
              <div className="modal-actions">
                {entries[selectedDate] && (
                  <button className="delete-btn" onClick={handleDeleteEntry}>
                    🗑️ Delete
                  </button>
                )}
                <button
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveEntry}>
                  💾 Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
