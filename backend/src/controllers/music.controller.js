import { db } from "../config/db.js";

// ================= SAVE MUSIC =================
export const saveMusic = async (req, res) => {
  const { title, youtubeUrl } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!title || title.trim() === "" || !youtubeUrl || youtubeUrl.trim() === "") {
    return res.status(400).json({ message: "Title and youtubeUrl are required" });
  }

  // Basic URL validation
  const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/;
  if (!urlPattern.test(youtubeUrl.trim())) {
    return res.status(400).json({ message: "Invalid YouTube URL" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO music (user_id, title, youtube_url) VALUES (?, ?, ?)`,
      [userId, title.trim(), youtubeUrl.trim()]
    );

    return res.status(201).json({
      message: "Music saved successfully",
      data: {
        id: result.insertId,
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
      },
    });
  } catch (err) {
    console.error("Error saving music:", err);
    return res.status(500).json({ message: "Failed to save music" });
  }
};

// ================= GET MUSIC LIST =================
export const getMusicList = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [music] = await db.query(
      `SELECT id, title, youtube_url, created_at 
       FROM music 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      message: "Music list retrieved successfully",
      data: music,
    });
  } catch (err) {
    console.error("Error fetching music:", err);
    return res.status(500).json({ message: "Failed to fetch music" });
  }
};

// ================= DELETE MUSIC =================
export const deleteMusic = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify music belongs to user
    const [musicCheck] = await db.query(
      `SELECT id FROM music WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (musicCheck.length === 0) {
      return res.status(404).json({ message: "Music not found" });
    }

    await db.query(`DELETE FROM music WHERE id = ?`, [id]);

    return res.status(200).json({
      message: "Music deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting music:", err);
    return res.status(500).json({ message: "Failed to delete music" });
  }
};
