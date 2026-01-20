import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getSubjects,
  addSubject,
  deleteSubject,
  getSubjectPoints,
  addPoint,
  updatePoint,
  deletePoint,
} from "../controllers/notes.controller.js";

const router = express.Router();

router.use(authMiddleware);

// Subjects
router.get("/subjects", getSubjects);
router.post("/subjects", addSubject);
router.delete("/subjects/:id", deleteSubject);

// Points
router.get("/subjects/:subjectId/points", getSubjectPoints);
router.post("/subjects/:subjectId/points", addPoint);
router.put("/points/:pointId", updatePoint);
router.delete("/points/:pointId", deletePoint);

export default router;
