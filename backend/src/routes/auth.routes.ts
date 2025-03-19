import express from "express";
import {
  getUserProfile,
  login,
  register,
} from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateUser, getUserProfile);

export default router;
