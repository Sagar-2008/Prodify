import express from "express";
import {
  createNote,
  addPointToNote,
  updateMasteryLevel,
  getNotesWithPoints,
} from "../controllers/notes.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createNote);
router.post("/points", verifyToken, addPointToNote);
router.put("/points/mastery", verifyToken, updateMasteryLevel);
router.get("/", verifyToken, getNotesWithPoints);

export default router;
