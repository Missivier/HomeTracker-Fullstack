import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Interface pour étendre la requête Express avec l'utilisateur
interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("==== DÉBUT MIDDLEWARE AUTHENTIFICATION ====");
  console.log(`Vérification d'authentification: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("Authorization header manquant");
      return res.status(401).json({ message: "Non autorisé - Token manquant" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("Format du token invalide (doit commencer par 'Bearer ')");
      return res
        .status(401)
        .json({ message: "Non autorisé - Format du token invalide" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token trouvé, vérification en cours...");
    console.log(
      "Token (premiers 20 caractères) :",
      token.substring(0, 20) + "..."
    );

    // Vérification de JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET non défini dans les variables d'environnement!"
      );
      return res
        .status(500)
        .json({ message: "Erreur de configuration du serveur" });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as jwt.JwtPayload;

      console.log("Token valide. Données décodées:", {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });

      // Ajouter les informations utilisateur à la requête
      (req as AuthRequest).user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      // Optionnellement, vérifier si l'utilisateur existe toujours dans la base de données
      console.log(
        `Vérification de l'existence de l'utilisateur ID: ${decoded.id}`
      );
      const userExists = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!userExists) {
        console.log(
          `Utilisateur ID ${decoded.id} non trouvé dans la base de données`
        );
        return res
          .status(401)
          .json({ message: "Non autorisé - Utilisateur non trouvé" });
      }

      console.log(
        "Authentification réussie pour l'utilisateur ID:",
        decoded.id
      );
      next();
    } catch (jwtError) {
      console.error("Erreur de vérification JWT:", jwtError);

      // Vérifier si c'est une erreur d'expiration de token
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: "Non autorisé - Token expiré",
          expired: true,
        });
      }

      return res.status(401).json({ message: "Non autorisé - Token invalide" });
    }
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return res.status(401).json({ message: "Non autorisé - Token invalide" });
  } finally {
    console.log("==== FIN MIDDLEWARE AUTHENTIFICATION ====");
  }
};
