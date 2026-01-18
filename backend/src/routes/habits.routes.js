import express from "express";
import {
  createHabit,
  getHabits,
  toggleHabitLog,
  getMonthlyHabitData,
} from "../controllers/habits.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createHabit);
router.get("/", verifyToken, getHabits);
router.post("/toggle", verifyToken, toggleHabitLog);
router.get("/monthly", verifyToken, getMonthlyHabitData);

export default router;
