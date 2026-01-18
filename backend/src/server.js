import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import pomodoroRoutes from "./routes/pomodoro.routes.js";
import habitsRoutes from "./routes/habits.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import musicRoutes from "./routes/music.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/pomodoro", pomodoroRoutes);
app.use("/habits", habitsRoutes);
app.use("/notes", notesRoutes);
app.use("/music", musicRoutes);
app.use("/analytics", analyticsRoutes);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
