import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Notes.css";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newSubject, setNewSubject] = useState("");
  const [newPointTitle, setNewPointTitle] = useState("");
  const [newPointDesc, setNewPointDesc] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/notes";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(API_BASE, { headers: getHeaders() });
      const fetchedNotes = res.data.data || [];
      setNotes(fetchedNotes);
      if (fetchedNotes.length > 0 && !selectedNote) {
        setSelectedNote(fetchedNotes[0]);
      }
      return fetchedNotes;
    } catch (err) {
      console.error("Error fetching notes:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    try {
      const res = await axios.post(
        API_BASE,
        { subject: newSubject },
        { headers: getHeaders() }
      );
      setNewSubject("");
      await fetchNotes();
      // Select the newly created note
      if (res.data.data) {
        setSelectedNote(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create note");
    }
  };

  const addPoint = async (e) => {
    e.preventDefault();
    if (!selectedNote || !newPointTitle.trim()) return;

    try {
      await axios.post(
        `${API_BASE}/points`,
        {
          noteId: selectedNote.id,
          title: newPointTitle,
          description: newPointDesc,
        },
        { headers: getHeaders() }
      );
      setNewPointTitle("");
      setNewPointDesc("");
      const updatedNotes = await fetchNotes();
      // Re-select the note with updated points
      if (selectedNote) {
        const updated = updatedNotes.find((n) => n.id === selectedNote.id);
        if (updated) setSelectedNote(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add point");
    }
  };

  const updateMastery = async (pointId, newLevel) => {
    try {
      await axios.put(
        `${API_BASE}/points/mastery`,
        { pointId, masteryLevel: newLevel },
        { headers: getHeaders() }
      );
      const updatedNotes = await fetchNotes();
      if (selectedNote) {
        const updated = updatedNotes.find((n) => n.id === selectedNote.id);
        if (updated) setSelectedNote(updated);
      }
    } catch (err) {
      console.error("Error updating mastery:", err);
    }
  };

  const getMasteryColor = (level) => {
    if (level >= 80) return "#10b981"; // green
    if (level >= 50) return "#f59e0b"; // yellow
    if (level >= 25) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  if (loading) {
    return <div className="notes-loading">Loading notes...</div>;
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h1>Notes & Mastery</h1>
        <p>Organize your study notes by subject and track mastery levels</p>
      </div>

      <div className="notes-container">
        {/* Left: Subject List */}
        <div className="notes-sidebar">
          <form onSubmit={createNote} className="note-form">
            <input
              type="text"
              placeholder="New subject (e.g., 'Calculus')"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="note-input"
            />
            <button type="submit" className="btn-primary note-btn">
              Add Subject
            </button>
          </form>

          <div className="notes-list">
            {notes.map((note) => (
              <button
                key={note.id}
                className={`note-item ${selectedNote?.id === note.id ? "active" : ""}`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="note-item-title">{note.subject}</div>
                <div className="note-item-count">
                  {note.points?.length || 0} points
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Points View */}
        <div className="notes-content">
          {selectedNote ? (
            <>
              <div className="notes-content-header">
                <h2>{selectedNote.subject}</h2>
              </div>

              <form onSubmit={addPoint} className="point-form">
                <input
                  type="text"
                  placeholder="Point title"
                  value={newPointTitle}
                  onChange={(e) => setNewPointTitle(e.target.value)}
                  className="point-input"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newPointDesc}
                  onChange={(e) => setNewPointDesc(e.target.value)}
                  className="point-textarea"
                  rows="2"
                />
                <button type="submit" className="btn-primary point-btn">
                  Add Point
                </button>
              </form>

              <div className="points-list">
                {selectedNote.points && selectedNote.points.length > 0 ? (
                  selectedNote.points.map((point) => (
                    <div key={point.id} className="point-card">
                      <div className="point-header">
                        <h3 className="point-title">{point.title}</h3>
                        <div
                          className="mastery-badge"
                          style={{ backgroundColor: getMasteryColor(point.mastery_level || 0) }}
                        >
                          {point.mastery_level || 0}%
                        </div>
                      </div>

                      {point.description && (
                        <p className="point-description">{point.description}</p>
                      )}

                      <div className="mastery-controls">
                        <label>Mastery Level:</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={point.mastery_level || 0}
                          onChange={(e) => updateMastery(point.id, parseInt(e.target.value))}
                          className="mastery-slider"
                        />
                        <span className="mastery-value">{point.mastery_level || 0}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="points-empty">
                    No points yet. Add your first point above!
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="notes-empty">
              {notes.length === 0
                ? "Create your first subject to get started!"
                : "Select a subject to view its points"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
