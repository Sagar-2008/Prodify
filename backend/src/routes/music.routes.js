import express from "express";
import {
  saveMusic,
  getMusicList,
  deleteMusic,
} from "../controllers/music.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, saveMusic);
router.get("/", verifyToken, getMusicList);
router.delete("/:id", verifyToken, deleteMusic);

export default router;
