import express from "express";
import {
  getUserProfile,
  login,
  refreshToken,
  register,
} from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Middleware de logging spécifique aux routes d'authentification
router.use((req, res, next) => {
  console.log(`[AUTH ROUTE] ${req.method} ${req.path}`);
  next();
});

// Routes publiques (ne nécessitant pas d'authentification)
console.log("Configuration des routes d'authentification:");
console.log("- POST /register (publique)");
console.log("- POST /login (publique)");
console.log("- POST /refresh-token (publique)");
console.log("- GET /profile (protégée)");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Routes protégées (nécessitant une authentification)
router.get("/profile", authenticateUser, getUserProfile);

export default router;
