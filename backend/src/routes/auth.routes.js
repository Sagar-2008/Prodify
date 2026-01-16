import express from "express";
import {
  register,
  verifyOtp,
  login,
  resendOtp,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);

export default router;
