import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes.js";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour analyser le JSON
app.use(express.json());

// Configuration CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/users", authRoutes);

app.get("/", (req, res) => {
  res.send("HomeTracker API is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
