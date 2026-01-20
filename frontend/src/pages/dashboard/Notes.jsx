import { useEffect, useState, useCallback } from "react";
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

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setLoading(false);
    }
  }, []);

  const fetchPoints = useCallback(async () => {
    try {
      const res = await getSubjectPoints(selectedSubject.id);
      setPoints(res.data);
    } catch (error) {
      console.error("Failed to fetch points:", error);
    }
  }, [selectedSubject]);

  useEffect(() => {
    (async () => {
      await fetchSubjects();
    })();
  }, [fetchSubjects]);

  useEffect(() => {
    if (selectedSubject) {
      (async () => {
        await fetchPoints();
      })();
    }
  }, [selectedSubject, fetchPoints]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectTitle.trim()) return;

    try {
      const res = await addSubject(newSubjectTitle);
      setSubjects([...subjects, res.data]);
      setNewSubjectTitle("");
    } catch (error) {
      console.error("Failed to add subject:", error);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
      if (selectedSubject?.id === id) {
        setSelectedSubject(null);
        setPoints([]);
      }
    } catch (error) {
      console.error("Failed to delete subject:", error);
    }
  };

  const handleAddPoint = async (e) => {
    e.preventDefault();
    if (!newPointTitle.trim() || !selectedSubject) return;

    try {
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
    } catch (error) {
      console.error("Failed to add point:", error);
    }
  };

  const handleUpdatePoint = async (id) => {
    if (!selectedSubject) return;
    try {
      const data = {
        title: editingPoint.pointTitle,
        description: editingPoint.description,
        mastery: editingPoint.masteryLevel,
      };
      const res = await updatePoint(selectedSubject.id, id, data);
      setPoints(points.map((p) => (p.id === id ? { ...p, ...res.data } : p)));
      setEditingPoint(null);
    } catch (error) {
      console.error("Failed to update point:", error);
    }
  };

  const handleDeletePoint = async (id) => {
    if (!selectedSubject) return;
    try {
      await deletePoint(selectedSubject.id, id);
      setPoints(points.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete point:", error);
    }
  };

  if (loading) {
    return (
      <div className="notes-page">
        <h1>Notes</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="notes-page">
      <h1>Notes</h1>

      <div className="notes-container">
        <div className="subjects-sidebar">
          <h2>Subjects</h2>

          <form onSubmit={handleAddSubject} className="add-subject-form">
            <input
              type="text"
              placeholder="Add new subject..."
              value={newSubjectTitle}
              onChange={(e) => setNewSubjectTitle(e.target.value)}
              className="subject-input"
            />
            <button type="submit" className="add-btn">
              +
            </button>
          </form>

          <div className="subjects-list">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`subject-item ${
                  selectedSubject?.id === subject.id ? "active" : ""
                }`}
              >
                <button
                  className="subject-btn"
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject.title}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteSubject(subject.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="points-content">
          {selectedSubject ? (
            <>
              <h2>{selectedSubject.title}</h2>

              <form onSubmit={handleAddPoint} className="add-point-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Point title..."
                    value={newPointTitle}
                    onChange={(e) => setNewPointTitle(e.target.value)}
                    className="point-input"
                  />
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="Description..."
                    value={newPointDesc}
                    onChange={(e) => setNewPointDesc(e.target.value)}
                    className="point-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <select
                    value={newPointMastery}
                    onChange={(e) => setNewPointMastery(e.target.value)}
                    className="mastery-select"
                  >
                    <option value="rookie">🟢 Rookie</option>
                    <option value="intermediate">🟡 Intermediate</option>
                    <option value="advanced">🟠 Advanced</option>
                    <option value="ace">🔴 Ace</option>
                  </select>
                </div>

                <button type="submit" className="add-point-btn">
                  Add Point
                </button>
              </form>

              <div className="points-list">
                {points.length === 0 ? (
                  <p className="empty-message">No points yet. Add one!</p>
                ) : (
                  points.map((point) => (
                    <div key={point.id} className="point-card">
                      {editingPoint?.id === point.id ? (
                        <div className="point-edit">
                          <input
                            type="text"
                            value={editingPoint.pointTitle}
                            onChange={(e) =>
                              setEditingPoint({
                                ...editingPoint,
                                pointTitle: e.target.value,
                              })
                            }
                            className="edit-input"
                          />
                          <textarea
                            value={editingPoint.description}
                            onChange={(e) =>
                              setEditingPoint({
                                ...editingPoint,
                                description: e.target.value,
                              })
                            }
                            className="edit-textarea"
                            rows="3"
                          />
                          <select
                            value={editingPoint.masteryLevel}
                            onChange={(e) =>
                              setEditingPoint({
                                ...editingPoint,
                                masteryLevel: e.target.value,
                              })
                            }
                            className="mastery-select"
                          >
                            <option value="rookie">🟢 Rookie</option>
                            <option value="intermediate">
                              🟡 Intermediate
                            </option>
                            <option value="advanced">🟠 Advanced</option>
                            <option value="ace">🔴 Ace</option>
                          </select>
                          <div className="edit-actions">
                            <button
                              onClick={() => handleUpdatePoint(point.id)}
                              className="save-btn"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPoint(null)}
                              className="cancel-btn"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="point-header">
                            <h3>{point.title || point.pointTitle}</h3>
                            <span
                              className={`mastery-badge ${point.mastery || point.masteryLevel}`}
                            >
                              {(point.mastery || point.masteryLevel) ===
                                "rookie" && "🟢"}
                              {(point.mastery || point.masteryLevel) ===
                                "intermediate" && "🟡"}
                              {(point.mastery || point.masteryLevel) ===
                                "advanced" && "🟠"}
                              {(point.mastery || point.masteryLevel) ===
                                "ace" && "🔴"}
                              {" " + (point.mastery || point.masteryLevel)}
                            </span>
                          </div>
                          <p className="point-description">
                            {point.description}
                          </p>
                          <div className="point-actions">
                            <button
                              onClick={() =>
                                setEditingPoint({
                                  id: point.id,
                                  pointTitle:
                                    point.title || point.pointTitle || "",
                                  description: point.description || "",
                                  masteryLevel:
                                    point.mastery ||
                                    point.masteryLevel ||
                                    "rookie",
                                })
                              }
                              className="edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePoint(point.id)}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="no-subject">
              <p>Select a subject to view points</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
