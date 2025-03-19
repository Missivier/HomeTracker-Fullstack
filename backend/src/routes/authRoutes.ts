import express from "express";
import {
  getUserProfile,
  login,
  register,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateUser, getUserProfile);

export default router;

// Dans votre fichier d'application principal (app.js ou index.js)
import authRoutes from "./routes/authRoutes.js";
app.use("/api/users", authRoutes);
