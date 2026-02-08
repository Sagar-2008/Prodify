import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import pomodoroRoutes from "./routes/pomodoro.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

// Simple request logger to help debug incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.path}`);
  next();
});


app.use("/habits", habitRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/pomodoro", pomodoroRoutes);
app.use("/journal", journalRoutes);

// Quick health POST route for debugging
app.post('/__test_post', (req, res) => {
  console.log('Received test POST', req.method, req.path, req.body ? 'with body' : 'no body');
  res.json({ ok: true });
});

// Quick unprotected GET route to confirm server availability
app.get('/__test_get', (req, res) => {
  console.log('Received test GET', req.method, req.path);
  res.json({ ok: true, time: new Date().toISOString() });
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
