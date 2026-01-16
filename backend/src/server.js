import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
