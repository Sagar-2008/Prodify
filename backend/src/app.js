import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import pomodoroRoutes from "./routes/pomodoro.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import productivityRoutes from "./routes/productivity.routes.js";

export const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const localDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");
    if (!origin || localDevOrigin) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: "6mb" }));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.path}`);
  next();
});

app.use("/habits", habitRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/pomodoro", pomodoroRoutes);
app.use("/journal", journalRoutes);
app.use("/productivity", productivityRoutes);

