import express from "express";
import {
  getHabits,
  addHabit,
  deleteHabit,
  toggleHabit,
  getHabitsByMonth,
  getTodayHabits,
  getHabitAnalytics,
} from "../controllers/habit.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getHabits);
router.get("/today", getTodayHabits);
router.get("/month", getHabitsByMonth);
router.get("/analytics", getHabitAnalytics);

router.post("/", addHabit);
router.delete("/:id", deleteHabit);
router.post("/:id/toggle", verifyToken, toggleHabit);

export default router;
