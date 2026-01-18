import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getAnalytics);

export default router;
