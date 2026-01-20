import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
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

router.use(verifyToken);

// Subjects
router.get("/subjects", getSubjects);
router.post("/subjects", addSubject);
router.delete("/subjects/:subjectId", deleteSubject);

// Points
router.get("/subjects/:subjectId/points", getSubjectPoints);
router.post("/subjects/:subjectId/points", addPoint);
router.put("/subjects/:subjectId/points/:pointId", updatePoint);
router.delete("/subjects/:subjectId/points/:pointId", deletePoint);

export default router;
