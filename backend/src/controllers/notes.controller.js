import { db } from "../config/db.js";

// ================= CREATE NOTE SUBJECT =================
export const createNote = async (req, res) => {
  const { subject } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!subject || subject.trim() === "") {
    return res.status(400).json({ message: "Subject is required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO notes (user_id, subject) VALUES (?, ?)`,
      [userId, subject.trim()]
    );

    return res.status(201).json({
      message: "Note subject created successfully",
      data: {
        id: result.insertId,
        subject: subject.trim(),
        userId,
      },
    });
  } catch (err) {
    console.error("Error creating note:", err);
    return res.status(500).json({ message: "Failed to create note" });
  }
};

// ================= ADD POINT TO NOTE =================
export const addPointToNote = async (req, res) => {
  const { noteId, title, description, masteryLevel } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!noteId || !title || title.trim() === "") {
    return res.status(400).json({ message: "noteId and title are required" });
  }

  try {
    // Verify note belongs to user
    const [noteCheck] = await db.query(
      `SELECT id FROM notes WHERE id = ? AND user_id = ?`,
      [noteId, userId]
    );

    if (noteCheck.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    const level = masteryLevel !== undefined ? Math.max(0, Math.min(100, parseInt(masteryLevel))) : 0;

    const [result] = await db.query(
      `INSERT INTO note_points (note_id, title, description, mastery_level) 
       VALUES (?, ?, ?, ?)`,
      [noteId, title.trim(), description || null, level]
    );

    return res.status(201).json({
      message: "Point added successfully",
      data: {
        id: result.insertId,
        title: title.trim(),
        description: description || null,
        masteryLevel: level,
      },
    });
  } catch (err) {
    console.error("Error adding point:", err);
    return res.status(500).json({ message: "Failed to add point" });
  }
};

// ================= UPDATE MASTERY LEVEL =================
export const updateMasteryLevel = async (req, res) => {
  const { pointId, masteryLevel } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!pointId || masteryLevel === undefined) {
    return res.status(400).json({ message: "pointId and masteryLevel are required" });
  }

  try {
    // Verify point belongs to user's note
    const [pointCheck] = await db.query(
      `SELECT np.id FROM note_points np
       INNER JOIN notes n ON np.note_id = n.id
       WHERE np.id = ? AND n.user_id = ?`,
      [pointId, userId]
    );

    if (pointCheck.length === 0) {
      return res.status(404).json({ message: "Point not found" });
    }

    const level = Math.max(0, Math.min(100, parseInt(masteryLevel)));

    await db.query(
      `UPDATE note_points SET mastery_level = ? WHERE id = ?`,
      [level, pointId]
    );

    return res.status(200).json({
      message: "Mastery level updated",
      data: { masteryLevel: level },
    });
  } catch (err) {
    console.error("Error updating mastery level:", err);
    return res.status(500).json({ message: "Failed to update mastery level" });
  }
};

// ================= GET ALL NOTES WITH POINTS =================
export const getNotesWithPoints = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [notes] = await db.query(
      `SELECT id, subject, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Get all points for user's notes
    const [points] = await db.query(
      `SELECT np.id, np.note_id, np.title, np.description, np.mastery_level, np.created_at, np.updated_at
       FROM note_points np
       INNER JOIN notes n ON np.note_id = n.id
       WHERE n.user_id = ?
       ORDER BY np.created_at ASC`,
      [userId]
    );

    // Group points by note_id
    const notesWithPoints = notes.map((note) => {
      const notePoints = points
        .filter((point) => point.note_id === note.id)
        .map(({ note_id, ...point }) => point);

      return {
        id: note.id,
        subject: note.subject,
        created_at: note.created_at,
        points: notePoints,
      };
    });

    return res.status(200).json({
      message: "Notes retrieved successfully",
      data: notesWithPoints,
    });
  } catch (err) {
    console.error("Error fetching notes:", err);
    return res.status(500).json({ message: "Failed to fetch notes" });
  }
};
