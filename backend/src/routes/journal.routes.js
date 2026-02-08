import express from "express";
import {
  getJournalEntries,
  getJournalByMonth,
  getJournalEntry,
  createOrUpdateJournal,
  deleteJournalEntry,
  getJournalStats,
} from "../controllers/journal.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getJournalEntries);
router.get("/month", getJournalByMonth);
router.get("/stats", getJournalStats);
router.get("/:id", getJournalEntry);

router.post("/", createOrUpdateJournal);
router.delete("/:id", deleteJournalEntry);

export default router;
