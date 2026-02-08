import { db } from "../config/db.js";

/* GET all journal entries for a user */
export const getJournalEntries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [entries] = await db.query(
      "SELECT id, user_id, entry_date, title, content, mood, created_at, updated_at FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC",
      [userId]
    );
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch journal entries" });
  }
};

/* GET journal entries for a specific month */
export const getJournalByMonth = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month required" });
    }

    const [entries] = await db.query(
      "SELECT id, user_id, entry_date, title, content, mood FROM journal_entries WHERE user_id = ? AND YEAR(entry_date) = ? AND MONTH(entry_date) = ?",
      [userId, year, month]
    );
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch journal entries" });
  }
};

/* GET a specific journal entry */
export const getJournalEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const entryId = req.params.id;

    const [entries] = await db.query(
      "SELECT id, user_id, entry_date, title, content, mood, created_at, updated_at FROM journal_entries WHERE id = ? AND user_id = ?",
      [entryId, userId]
    );

    if (entries.length === 0) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    res.json(entries[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch journal entry" });
  }
};

/* CREATE or UPDATE journal entry for a specific date */
export const createOrUpdateJournal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { entry_date, title, content, mood } = req.body;

    if (!entry_date || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "Entry date and content required" });
    }

    // Check if entry already exists for this date
    const [existing] = await db.query(
      "SELECT id FROM journal_entries WHERE user_id = ? AND entry_date = ?",
      [userId, entry_date]
    );

    if (existing.length > 0) {
      // UPDATE existing entry
      await db.query(
        "UPDATE journal_entries SET title = ?, content = ?, mood = ? WHERE user_id = ? AND entry_date = ?",
        [title?.trim() || null, content.trim(), mood || "neutral", userId, entry_date]
      );
      return res.json({
        id: existing[0].id,
        entry_date,
        title: title?.trim() || null,
        content: content.trim(),
        mood: mood || "neutral",
        message: "Journal entry updated",
      });
    } else {
      // CREATE new entry
      const [result] = await db.query(
        "INSERT INTO journal_entries (user_id, entry_date, title, content, mood) VALUES (?, ?, ?, ?, ?)",
        [userId, entry_date, title?.trim() || null, content.trim(), mood || "neutral"]
      );

      res.status(201).json({
        id: result.insertId,
        entry_date,
        title: title?.trim() || null,
        content: content.trim(),
        mood: mood || "neutral",
        message: "Journal entry created",
      });
    }
  } catch (err) {
    console.error("Journal save error:", err);
    // Return error message for debugging (development only)
    res.status(500).json({ message: err?.message || "Failed to save journal entry", error: String(err) });
  }
};

/* DELETE journal entry */
export const deleteJournalEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const entryId = req.params.id;

    const [result] = await db.query(
      "DELETE FROM journal_entries WHERE id = ? AND user_id = ?",
      [entryId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    res.json({ message: "Journal entry deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete journal entry" });
  }
};

/* GET journal stats */
export const getJournalStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [stats] = await db.query(
      "SELECT COUNT(*) as total_entries, COUNT(DISTINCT MONTH(entry_date)) as months_active FROM journal_entries WHERE user_id = ?",
      [userId]
    );

    res.json(stats[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch journal stats" });
  }
};
