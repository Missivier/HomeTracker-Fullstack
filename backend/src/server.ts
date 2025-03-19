import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authenticateUser } from "./middlewares/authMiddleware.js";
import authRoutes from "./routes/auth.routes.js";
import houseRoutes from "./routes/house.routes.js";

// Charger les variables d'environnement
dotenv.config();

// Log pour vérifier les variables d'environnement
console.log("Vérification de l'environnement:", {
  PORT: process.env.PORT || 3000,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
  DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour analyser le JSON
app.use(express.json());

// Middleware pour analyser les cookies
app.use(cookieParser());

// Middleware de logging pour TOUTES les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Body:", req.body);
  }
  next();
});

// Configuration CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// IMPORTANT: Routes publiques d'authentification (sans middleware)
console.log("Configuration des routes publiques d'authentification");
app.use("/api/users", authRoutes);

// Routes protégées (avec authentification)
console.log("Configuration des routes protégées pour les maisons");
app.use("/api/houses", authenticateUser, houseRoutes);

app.get("/", (req, res) => {
  console.log("Route racine appelée");
  res.send("HomeTracker API is running");
});

// Middleware pour capturer les routes non trouvées
app.use((req, res) => {
  console.log(`[404] Route non trouvée: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route non trouvée" });
});

// Middleware pour gérer les erreurs globales
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);
  res.status(500).json({
    message: "Erreur interne du serveur",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
});
