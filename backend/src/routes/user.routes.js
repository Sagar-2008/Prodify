import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyToken, (req, res) => {
  res.json({
    message: "Protected data accessed",
    userId: req.user.userId,
  });
});

export default router;
