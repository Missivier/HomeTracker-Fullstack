import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Interface pour étendre la requête Express avec l'utilisateur
interface AuthRequest extends Request {
  user?: jwt.JwtPayload | string;
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Non autorisé - Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;

    // Optionnellement, vérifier si l'utilisateur existe toujours dans la base de données
    const userExists = await prisma.user.findUnique({
      where: { id: (decoded as jwt.JwtPayload).id },
    });

    if (!userExists) {
      return res
        .status(401)
        .json({ message: "Non autorisé - Utilisateur non trouvé" });
    }

    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return res.status(401).json({ message: "Non autorisé - Token invalide" });
  }
};
