import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { sendOtp } from "../utils/sendOtp.js";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await sendOtp(email, otp);

    await db.query(
      `INSERT INTO users (email, password, otp, otp_expires)
       VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, otp, expiry]
    );

    return res.status(201).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [rows] = await db.query(
      "SELECT otp, otp_expires FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    if (String(user.otp) !== String(otp)) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (new Date(user.otp_expires) < new Date()) {
      return res.status(401).json({ message: "OTP expired" });
    }

    await db.query(
      `UPDATE users 
       SET is_verified = true, otp = NULL, otp_expires = NULL 
       WHERE email = ?`,
      [email]
    );

    return res.json({ message: "Account verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Verification failed" });
  }
};

/* ================= RESEND OTP ================= */
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT is_verified FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    if (rows[0].is_verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await sendOtp(email, otp);

    await db.query(
      "UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?",
      [otp, expiry, email]
    );

    return res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to resend OTP" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const [rows] = await db.query(
      "SELECT id, password, is_verified FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    if (!user.is_verified)
      return res.status(403).json({ message: "Verify email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    // ✅ CREATE JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};
