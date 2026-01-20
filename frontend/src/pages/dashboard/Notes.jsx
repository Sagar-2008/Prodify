import { useEffect, useState } from "react";
import {
  getSubjects,
  addSubject,
  deleteSubject,
  getSubjectPoints,
  addPoint,
  updatePoint,
  deletePoint,
} from "../../api/notes.api";
import "../../styles/Notes.css";

const getMasteryColor = (mastery) => {
  const colors = {
    rookie: "#10b981",
    intermediate: "#f59e0b",
    advanced: "#f97316",
    ace: "#ef4444",
  };
  return colors[mastery] || "#999";
};

export default function Notes() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newSubjectTitle, setNewSubjectTitle] = useState("");
  const [newPointTitle, setNewPointTitle] = useState("");
  const [newPointDesc, setNewPointDesc] = useState("");
  const [newPointMastery, setNewPointMastery] = useState("rookie");

  const [editingPoint, setEditingPoint] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await getSubjects();
      setSubjects(res.data);
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!selectedSubject) return;
      const res = await getSubjectPoints(selectedSubject.id);
      setPoints(res.data);
    };
    fetchPoints();
  }, [selectedSubject]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectTitle.trim()) return;
    const res = await addSubject(newSubjectTitle);
    setSubjects([...subjects, res.data]);
    setNewSubjectTitle("");
  };

  const handleDeleteSubject = async (id) => {
    await deleteSubject(id);
    setSubjects(subjects.filter((s) => s.id !== id));
    if (selectedSubject?.id === id) {
      setSelectedSubject(null);
      setPoints([]);
    }
  };

  const handleAddPoint = async (e) => {
    e.preventDefault();
    if (!newPointTitle.trim() || !selectedSubject) return;
    const res = await addPoint(
      selectedSubject.id,
      newPointTitle,
      newPointDesc,
      newPointMastery,
    );
    setPoints([...points, res.data]);
    setNewPointTitle("");
    setNewPointDesc("");
    setNewPointMastery("rookie");
  };

  const handleUpdatePoint = async (id) => {
    const payload = {
      title: editingPoint.pointTitle,
      description: editingPoint.description,
      mastery: editingPoint.masteryLevel,
    };
    const res = await updatePoint(selectedSubject.id, id, payload);
    setPoints(points.map((p) => (p.id === id ? { ...p, ...res.data } : p)));
    setEditingPoint(null);
  };

  const handleDeletePoint = async (id) => {
    await deletePoint(selectedSubject.id, id);
    setPoints(points.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="notes-page loading">
        <div className="spinner" />
        <p>Loading your notes…</p>
      </div>
    );
  }

  return (
    <div className="notes-page">
      <header className="notes-header">
        <h1>Study Notes</h1>
        <p className="subtitle">Organize what you learn, topic by topic</p>
      </header>

      {/* SUBJECTS */}
      <section className="topics-section">
        <div className="topics-header">
          <h2>Your Topics</h2>
          <span>{subjects.length}</span>
        </div>

        <div className="topics-grid">
          {subjects.map((s) => (
            <div
              key={s.id}
              className={`topic-card ${
                selectedSubject?.id === s.id ? "active" : ""
              }`}
              onClick={() => setSelectedSubject(s)}
            >
              <h3>{s.title}</h3>
              <button
                className="delete-topic-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSubject(s.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}

          <form className="add-topic-card" onSubmit={handleAddSubject}>
            <input
              placeholder="New topic…"
              value={newSubjectTitle}
              onChange={(e) => setNewSubjectTitle(e.target.value)}
            />
            <button>Add Topic</button>
          </form>
        </div>
      </section>

      {/* CONTENT */}
      <section className="notes-content-section">
        {!selectedSubject ? (
          <div className="empty-state">
            <h2>Select a topic</h2>
            <p>Choose a topic to view and manage notes</p>
          </div>
        ) : (
          <>
            <header className="content-header">
              <h2>{selectedSubject.title}</h2>
              <span>{points.length} notes</span>
            </header>

            <form className="add-point-form" onSubmit={handleAddPoint}>
              <input
                placeholder="What did you learn?"
                value={newPointTitle}
                onChange={(e) => setNewPointTitle(e.target.value)}
              />
              <select
                value={newPointMastery}
                onChange={(e) => setNewPointMastery(e.target.value)}
              >
                <option value="rookie">Rookie</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="ace">Ace</option>
              </select>
              <textarea
                placeholder="Details…"
                value={newPointDesc}
                onChange={(e) => setNewPointDesc(e.target.value)}
              />
              <button>Add Note</button>
            </form>

            <div className="points-grid">
              {points.map((p) => (
                <div key={p.id} className="point-card">
                  {editingPoint?.id === p.id ? (
                    <>
                      <input
                        value={editingPoint.pointTitle}
                        onChange={(e) =>
                          setEditingPoint({
                            ...editingPoint,
                            pointTitle: e.target.value,
                          })
                        }
                      />
                      <textarea
                        value={editingPoint.description}
                        onChange={(e) =>
                          setEditingPoint({
                            ...editingPoint,
                            description: e.target.value,
                          })
                        }
                      />
                      <select
                        value={editingPoint.masteryLevel}
                        onChange={(e) =>
                          setEditingPoint({
                            ...editingPoint,
                            masteryLevel: e.target.value,
                          })
                        }
                      >
                        <option value="rookie">Rookie</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="ace">Ace</option>
                      </select>
                      <div className="actions">
                        <button onClick={() => handleUpdatePoint(p.id)}>
                          Save
                        </button>
                        <button onClick={() => setEditingPoint(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="mastery-bar"
                        style={{
                          background: getMasteryColor(
                            p.mastery || p.masteryLevel,
                          ),
                        }}
                      />
                      <div className="mastery-badge">
                        {(p.mastery || p.masteryLevel).charAt(0).toUpperCase() +
                          (p.mastery || p.masteryLevel).slice(1)}
                      </div>
                      <h3>{p.title || p.pointTitle}</h3>
                      {p.description && <p>{p.description}</p>}
                      <div className="actions">
                        <button
                          onClick={() =>
                            setEditingPoint({
                              id: p.id,
                              pointTitle: p.title || p.pointTitle,
                              description: p.description || "",
                              masteryLevel: p.mastery || p.masteryLevel,
                            })
                          }
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeletePoint(p.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
