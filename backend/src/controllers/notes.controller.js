import { db } from "../config/db.js";

/* GET all subjects for a user */
export const getSubjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [subjects] = await db.query(
      "SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

/* ADD subject */
export const addSubject = async (req, res) => {
  const { title } = req.body;
  const userId = req.user.userId;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO subjects (user_id, title) VALUES (?, ?)",
      [userId, title.trim()]
    );

    res.status(201).json({
      id: result.insertId,
      title: title.trim(),
      user_id: userId,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add subject" });
  }
};

/* DELETE subject (cascade-safe) */
export const deleteSubject = async (req, res) => {
  const userId = req.user.userId;
  const subjectId = req.params.subjectId;

  try {
    // Delete related points first
    await db.query(
      "DELETE FROM subject_points WHERE subject_id = ? AND user_id = ?",
      [subjectId, userId]
    );

    // Delete the subject
    await db.query(
      "DELETE FROM subjects WHERE id = ? AND user_id = ?",
      [subjectId, userId]
    );

    res.json({ message: "Subject deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete subject" });
  }
};

/* GET all points for a subject */
export const getSubjectPoints = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subjectId = req.params.subjectId;

    const [points] = await db.query(
      "SELECT id, point_title as title, description, mastery_level as mastery, created_at FROM subject_points WHERE subject_id = ? AND user_id = ? ORDER BY created_at DESC",
      [subjectId, userId]
    );

    res.json(points);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch points" });
  }
};

/* ADD point to subject */
export const addPoint = async (req, res) => {
  const { title, description, mastery } = req.body;
  const userId = req.user.userId;
  const subjectId = req.params.subjectId;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO subject_points (subject_id, user_id, point_title, description, mastery_level) VALUES (?, ?, ?, ?, ?)",
      [subjectId, userId, title.trim(), description || "", mastery || "rookie"]
    );

    res.status(201).json({
      id: result.insertId,
      subject_id: subjectId,
      title: title.trim(),
      description: description || "",
      mastery: mastery || "rookie",
      user_id: userId,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add point" });
  }
};

/* UPDATE point */
export const updatePoint = async (req, res) => {
  const { title, description, mastery } = req.body;
  const userId = req.user.userId;
  const subjectId = req.params.subjectId;
  const pointId = req.params.pointId;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title required" });
  }

  try {
    await db.query(
      "UPDATE subject_points SET point_title = ?, description = ?, mastery_level = ? WHERE id = ? AND subject_id = ? AND user_id = ?",
      [title.trim(), description || "", mastery || "rookie", pointId, subjectId, userId]
    );

    res.json({
      id: pointId,
      subject_id: subjectId,
      title: title.trim(),
      description: description || "",
      mastery: mastery || "rookie",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update point" });
  }
};

/* DELETE point */
export const deletePoint = async (req, res) => {
  const userId = req.user.userId;
  const subjectId = req.params.subjectId;
  const pointId = req.params.pointId;

  try {
    await db.query(
      "DELETE FROM subject_points WHERE id = ? AND subject_id = ? AND user_id = ?",
      [pointId, subjectId, userId]
    );

    res.json({ message: "Point deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete point" });
  }
};
