import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import pomodoroRoutes from "./routes/pomodoro.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());


app.use("/habits", habitRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/pomodoro", pomodoroRoutes);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
