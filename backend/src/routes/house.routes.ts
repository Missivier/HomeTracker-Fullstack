import express from "express";
import {
  createHouse,
  generateInviteCode,
  getHouseDetails,
  getHouseMembers,
  joinHouse,
} from "../controllers/houseController.js";

const router = express.Router();

// Middleware de logging spécifique aux routes de maison
router.use((req, res, next) => {
  console.log(`[HOUSE ROUTE] ${req.method} ${req.path}`);
  console.log("User from token:", (req as any).user);
  next();
});

// Note: le middleware authenticateUser est appliqué dans server.ts
// pour toutes les routes commençant par /api/houses

console.log("Configuration des routes de maison (toutes protégées):");
console.log("- POST / (créer une maison)");
console.log("- POST /join (rejoindre une maison)");
console.log("- GET /:id (détails d'une maison)");
console.log("- POST /:id/invite (générer un code d'invitation)");
console.log("- GET /:id/members (membres d'une maison)");

// Créer une maison
router.post("/", createHouse);

// Rejoindre une maison avec un code d'invitation
router.post("/join", joinHouse);

// Obtenir les détails d'une maison
router.get("/:id", getHouseDetails);

// Générer un code d'invitation
router.post("/:id/invite", generateInviteCode);

// Obtenir les membres d'une maison
router.get("/:id/members", getHouseMembers);

export default router;
