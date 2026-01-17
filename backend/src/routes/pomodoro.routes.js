import express from "express";
import {
  savePomodoroSession,
  getPomodoroSessions,
  getPomodoroStats,
} from "../controllers/pomodoro.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/session", verifyToken, savePomodoroSession);
router.get("/sessions", verifyToken, getPomodoroSessions);
router.get("/stats", verifyToken, getPomodoroStats);

export default router;
