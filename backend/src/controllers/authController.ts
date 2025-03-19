import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
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
  try {
    // Validation avec Zod
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
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

    // Vérifier si l'email existe déjà
    const existingUserEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserEmail) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Vérifier si le téléphone existe déjà (s'il est fourni)
    if (phone) {
      const existingUserPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUserPhone) {
        return res
          .status(400)
          .json({ message: "Ce numéro de téléphone est déjà utilisé" });
      }
    }

    // Récupérer le rôle "USER" par défaut
    const userRole = await prisma.userRole.findFirst({
      where: { name: "USER" },
    });

    if (!userRole) {
      return res.status(500).json({
        message: "Erreur lors de l'attribution du rôle utilisateur",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
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

    // Supprimer le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = newUser;

    // Optionnellement, générer un token JWT pour une connexion automatique
    // const token = jwt.sign(
    //   { id: newUser.id, email: newUser.email, role: userRole.name },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: '1d' }
    // );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: userWithoutPassword,
      // token
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de l'inscription",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validation avec Zod
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Données de connexion invalides",
        errors: validationResult.error.format(),
      });
    }

    const { email, password } = validationResult.data;

    // Trouver l'utilisateur par email
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
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // Supprimer le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Connexion réussie",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id; // Récupéré par le middleware d'authentification

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
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer le mot de passe de la réponse
    const { password, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
