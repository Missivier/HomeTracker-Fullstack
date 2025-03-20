import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const prisma = new PrismaClient();
const saltRounds = 10;

// Schémas de validation Zod
const registerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  username: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Interface pour l'utilisateur authentifié dans la requête
interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export const register = async (req: Request, res: Response) => {
  console.log("==== DÉBUT REGISTER ====");
  console.log("Body reçu:", req.body);
  try {
    // Validation avec Zod
    console.log("Validation des données...");
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log("Validation échouée:", validationResult.error.format());
      return res.status(400).json({
        message: "Données d'inscription invalides",
        errors: validationResult.error.format(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      username,
      phone,
      birthDate,
      description,
    } = validationResult.data;

    console.log(`Vérification si l'email '${email}' existe déjà...`);
    // Vérifier si l'email existe déjà
    const existingUserEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserEmail) {
      console.log(`Email '${email}' déjà utilisé!`);
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Vérifier si le téléphone existe déjà (s'il est fourni)
    if (phone) {
      console.log(`Vérification si le téléphone '${phone}' existe déjà...`);
      const existingUserPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUserPhone) {
        console.log(`Téléphone '${phone}' déjà utilisé!`);
        return res
          .status(400)
          .json({ message: "Ce numéro de téléphone est déjà utilisé" });
      }
    }

    // Récupérer le rôle "NO_ROLE" par défaut
    console.log("Récupération du rôle NO_ROLE...");
    const userRole = await prisma.userRole.findFirst({
      where: { name: "NO_ROLE" },
    });

    if (!userRole) {
      console.log("Rôle NO_ROLE non trouvé!");
      return res.status(500).json({
        message: "Erreur lors de l'attribution du rôle utilisateur",
      });
    }
    console.log("Rôle trouvé:", userRole);

    // Préparation du hashage du mot de passe
    console.log("Préparation du hashage du mot de passe...");
    // Nettoyer le mot de passe s'il y a des espaces
    const cleanPassword = password.trim();

    // Hasher le mot de passe
    console.log("Hashage du mot de passe...");
    const hashedPassword = await bcryptjs.hash(cleanPassword, saltRounds);
    console.log(
      "Mot de passe hashé avec succès, longueur:",
      hashedPassword.length
    );

    // Créer l'utilisateur
    console.log("Création de l'utilisateur...");
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        username: username || null,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        description: description || null,
        inscriptionDate: new Date(),
        roleId: userRole.id,
      },
    });
    console.log("Utilisateur créé avec ID:", newUser.id);

    // Supprimer le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = newUser;

    console.log("Inscription réussie pour:", email);
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de l'inscription",
    });
  }
  console.log("==== FIN REGISTER ====");
};

export const login = async (req: Request, res: Response) => {
  console.log("==== DÉBUT LOGIN ====");
  console.log("Body reçu:", req.body);
  console.log("Headers:", req.headers);

  try {
    // Validation avec Zod
    console.log("Validation des données...");
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log("Validation échouée:", validationResult.error.format());
      return res.status(400).json({
        message: "Données de connexion invalides",
        errors: validationResult.error.format(),
      });
    }

    const { email, password } = validationResult.data;
    console.log(`Tentative de connexion pour l'email: ${email}`);

    // Trouver l'utilisateur par email
    console.log(`Recherche de l'utilisateur pour l'email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`Utilisateur non trouvé pour l'email: ${email}`);
      return res.status(401).json({ message: "Identifiants incorrects" });
    }
    console.log(`Utilisateur trouvé: ID ${user.id}, Rôle: ${user.role.name}`);

    // Logs supplémentaires pour le débogage
    console.log("Type du mot de passe fourni:", typeof password);
    console.log("Longueur du mot de passe fourni:", password.length);
    console.log("Type du mot de passe stocké:", typeof user.password);
    console.log("Longueur du mot de passe stocké:", user.password.length);
    console.log("Début du hash stocké:", user.password.substring(0, 20));

    // Vérifier le mot de passe avec trim() pour supprimer les espaces
    console.log("Vérification du mot de passe...");
    try {
      // Utilisation de .trim() pour supprimer les espaces potentiels
      const isPasswordValid = await bcryptjs.compare(
        password,
        user.password.trim()
      );
      console.log(`Mot de passe valide: ${isPasswordValid}`);

      if (!isPasswordValid) {
        console.log("Mot de passe invalide!");
        return res.status(401).json({ message: "Identifiants incorrects" });
      }
    } catch (compareError) {
      console.error(
        "Erreur lors de la comparaison des mots de passe:",
        compareError
      );
      return res
        .status(500)
        .json({ message: "Erreur lors de la vérification du mot de passe" });
    }

    // Vérification du JWT_SECRET
    if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      console.error(
        "JWT_SECRET ou REFRESH_TOKEN_SECRET non définis dans les variables d'environnement!"
      );
      return res
        .status(500)
        .json({ message: "Erreur de configuration du serveur" });
    }

    // Générer le token JWT
    console.log("Génération du token JWT...");
    try {
      const tokenId = uuidv4();

      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role.name,
          iat: Math.floor(Date.now() / 1000),
          iss: "hometracker-api", // émetteur du jeton
          jti: tokenId, // identifiant unique du jeton
          sub: user.id.toString(), // sujet du jeton
        },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );

      const refreshToken = jwt.sign(
        {
          id: user.id,
          jti: uuidv4(),
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      // Mettre à jour l'utilisateur avec le refresh token
      // Nous n'utiliserons pas cette partie jusqu'à ce que la migration soit appliquée
      /*
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: refreshToken },
      });
      */

      // Stocker le refreshToken dans un cookie HttpOnly
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      // Supprimer le mot de passe de la réponse
      const { password: _, ...userWithoutPassword } = user;

      console.log("Connexion réussie pour:", email);
      res.status(200).json({
        message: "Connexion réussie",
        user: userWithoutPassword,
        token: accessToken,
        accessToken,
      });
    } catch (jwtError) {
      console.error("Erreur lors de la génération du JWT:", jwtError);
      return res
        .status(500)
        .json({ message: "Erreur lors de la création du token" });
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
  console.log("==== FIN LOGIN ====");
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  console.log("==== DÉBUT GET USER PROFILE ====");
  console.log("User ID from token:", req.user.id);

  try {
    const userId = req.user.id; // Récupéré par le middleware d'authentification

    console.log(`Récupération du profil pour l'utilisateur ID: ${userId}`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            name: true,
          },
        },
        house: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`Utilisateur ID ${userId} non trouvé!`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer le mot de passe de la réponse
    const { password, ...userWithoutPassword } = user;

    console.log("Profil récupéré avec succès pour l'utilisateur ID:", userId);
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
  console.log("==== FIN GET USER PROFILE ====");
};

// Route pour rafraîchir le token
export const refreshToken = async (req: Request, res: Response) => {
  console.log("==== DÉBUT REFRESH TOKEN ====");

  // Récupérer le refresh token du cookie
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log("Refresh token manquant dans les cookies");
    return res.status(401).json({ message: "Refresh token requis" });
  }

  try {
    console.log("Vérification du refresh token...");

    // Vérifier si REFRESH_TOKEN_SECRET est défini
    if (!process.env.REFRESH_TOKEN_SECRET || !process.env.JWT_SECRET) {
      console.error("REFRESH_TOKEN_SECRET ou JWT_SECRET non défini");
      return res
        .status(500)
        .json({ message: "Erreur de configuration du serveur" });
    }

    // Vérifier le token de rafraîchissement
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload;

    console.log("Refresh token valide. Decoded:", decoded);

    // Trouver l'utilisateur
    console.log(`Recherche de l'utilisateur avec ID ${decoded.id}`);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`Utilisateur avec ID ${decoded.id} non trouvé`);
      return res
        .status(403)
        .json({ message: "Token de rafraîchissement invalide" });
    }

    /* À activer après la migration
    // Vérifier si le refresh token stocké correspond
    if (user.refreshToken !== refreshToken) {
      console.log("Le refresh token ne correspond pas à celui stocké");
      return res.status(403).json({ message: "Token de rafraîchissement invalide" });
    }
    */

    console.log("Génération d'un nouveau jeton d'accès...");
    // Générer un nouveau jeton d'accès
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role.name,
        iat: Math.floor(Date.now() / 1000),
        iss: "hometracker-api",
        jti: uuidv4(),
        sub: user.id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    console.log("Nouveau jeton d'accès généré");
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    res.status(403).json({ message: "Token de rafraîchissement invalide" });
  }

  console.log("==== FIN REFRESH TOKEN ====");
};
