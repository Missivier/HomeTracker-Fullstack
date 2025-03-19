import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { Request, Response } from "express";
import { z } from "zod";

const prisma = new PrismaClient();

// Interface pour l'utilisateur authentifié dans la requête
interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

// Schéma de validation pour la création d'une maison
const createHouseSchema = z.object({
  name: z.string().min(1, "Le nom de la maison est requis"),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

// Schéma de validation pour rejoindre une maison
const joinHouseSchema = z.object({
  inviteCode: z.string().min(1, "Le code d'invitation est requis"),
});

// Créer une nouvelle maison
export const createHouse = async (req: AuthRequest, res: Response) => {
  console.log("==== DÉBUT CREATE HOUSE ====");
  console.log("User ID from token:", req.user.id);
  console.log("Body reçu:", req.body);

  try {
    // Validation avec Zod
    console.log("Validation des données...");
    const validationResult = createHouseSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log("Validation échouée:", validationResult.error.format());
      return res.status(400).json({
        message: "Données invalides",
        errors: validationResult.error.format(),
      });
    }

    const { name, address, city, postalCode, country, description } =
      validationResult.data;

    // Vérifier si le nom de maison existe déjà
    console.log(`Vérification si le nom de maison '${name}' existe déjà...`);
    const existingHouse = await prisma.house.findUnique({
      where: { name },
    });

    if (existingHouse) {
      console.log(`Nom de maison '${name}' déjà utilisé!`);
      return res
        .status(400)
        .json({ message: "Ce nom de maison est déjà utilisé" });
    }

    // Transaction pour créer la maison et mettre à jour l'utilisateur
    console.log("Démarrage de la transaction...");
    const result = await prisma.$transaction(async (tx) => {
      // Créer la maison
      console.log("Création de la maison...");
      const house = await tx.house.create({
        data: {
          name,
          address: address || null,
          city: city || null,
          postalCode: postalCode || null,
          country: country || null,
          description: description || null,
        },
      });
      console.log("Maison créée avec ID:", house.id);

      // Récupérer le rôle ADMIN
      console.log("Récupération du rôle ADMIN...");
      const adminRole = await tx.userRole.findFirst({
        where: { name: "ADMIN" },
      });

      if (!adminRole) {
        console.log("Rôle ADMIN non trouvé!");
        throw new Error("Role ADMIN not found");
      }
      console.log("Rôle ADMIN trouvé avec ID:", adminRole.id);

      // Mettre à jour l'utilisateur
      console.log(`Mise à jour de l'utilisateur ID: ${req.user.id}`);
      const updatedUser = await tx.user.update({
        where: { id: req.user.id },
        data: {
          houseId: house.id,
          roleId: adminRole.id, // Définir comme ADMIN de la maison
        },
        include: {
          role: true,
          house: true,
        },
      });
      console.log(
        "Utilisateur mis à jour avec succès, nouveau rôle:",
        updatedUser.role.name
      );

      return { house, user: updatedUser };
    });

    console.log("Transaction réussie, maison créée avec ID:", result.house.id);
    res.status(201).json({
      message: "Maison créée avec succès",
      house: result.house,
      user: result.user,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la maison:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création de la maison",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
  console.log("==== FIN CREATE HOUSE ====");
};

// Obtenir les détails d'une maison
export const getHouseDetails = async (req: AuthRequest, res: Response) => {
  console.log("==== DÉBUT GET HOUSE DETAILS ====");
  console.log("User ID from token:", req.user.id);
  console.log("House ID requested:", req.params.id);

  try {
    const houseId = parseInt(req.params.id);

    // Vérifier si l'utilisateur a accès à cette maison
    console.log(
      `Vérification des droits d'accès pour l'utilisateur ID: ${req.user.id}`
    );
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { house: true },
    });

    if (!user) {
      console.log(`Utilisateur ID ${req.user.id} non trouvé!`);
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette maison",
      });
    }

    if (user.houseId !== houseId) {
      console.log(
        `L'utilisateur ID ${req.user.id} n'appartient pas à la maison ID ${houseId}!`
      );
      console.log(`House ID de l'utilisateur: ${user.houseId}`);
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette maison",
      });
    }

    // Récupérer les détails de la maison
    console.log(`Récupération des détails de la maison ID: ${houseId}`);
    const house = await prisma.house.findUnique({
      where: { id: houseId },
    });

    if (!house) {
      console.log(`Maison ID ${houseId} non trouvée!`);
      return res.status(404).json({ message: "Maison non trouvée" });
    }

    console.log("Détails de la maison récupérés avec succès");
    res.status(200).json(house);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
  console.log("==== FIN GET HOUSE DETAILS ====");
};

// Générer un code d'invitation
export const generateInviteCode = async (req: AuthRequest, res: Response) => {
  console.log("==== DÉBUT GENERATE INVITE CODE ====");
  console.log("User ID from token:", req.user.id);
  console.log("House ID:", req.params.id);

  try {
    const houseId = parseInt(req.params.id);

    // Vérifier si l'utilisateur a accès à cette maison et est ADMIN
    console.log(
      `Vérification des droits d'accès pour l'utilisateur ID: ${req.user.id}`
    );
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        house: true,
        role: true,
      },
    });

    if (!user) {
      console.log(`Utilisateur ID ${req.user.id} non trouvé!`);
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette maison",
      });
    }

    if (user.houseId !== houseId) {
      console.log(
        `L'utilisateur ID ${req.user.id} n'appartient pas à la maison ID ${houseId}!`
      );
      console.log(`House ID de l'utilisateur: ${user.houseId}`);
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette maison",
      });
    }

    // Vérifier si l'utilisateur est un ADMIN
    console.log(`Rôle de l'utilisateur: ${user.role.name}`);
    if (user.role.name !== "ADMIN" && user.role.name !== "MODERATOR") {
      console.log(
        `L'utilisateur n'a pas les permissions requises. Rôle: ${user.role.name}`
      );
      return res.status(403).json({
        message:
          "Vous n'avez pas les permissions pour générer un code d'invitation",
      });
    }

    // Générer un code d'invitation aléatoire
    console.log("Génération du code d'invitation...");
    const inviteCode = crypto.randomBytes(6).toString("hex").toUpperCase();

    // Enregistrer le code d'invitation (dans un environnement de production,
    // vous pourriez avoir une table dédiée pour stocker ces codes)
    // Ici on simule juste pour le prototype
    console.log("Code généré:", inviteCode);

    res.status(200).json({
      message: "Code d'invitation généré avec succès",
      inviteCode,
      expiresIn: "24h",
    });
  } catch (error) {
    console.error("Erreur lors de la génération du code:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
  console.log("==== FIN GENERATE INVITE CODE ====");
};

// Rejoindre une maison avec un code d'invitation
export const joinHouse = async (req: AuthRequest, res: Response) => {
  console.log("==== DÉBUT JOIN HOUSE ====");
  console.log("User ID from token:", req.user.id);
  console.log("Body reçu:", req.body);

  try {
    // Validation avec Zod
    console.log("Validation des données...");
    const validationResult = joinHouseSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log("Validation échouée:", validationResult.error.format());
      return res.status(400).json({
        message: "Données invalides",
        errors: validationResult.error.format(),
      });
    }

    const { inviteCode } = validationResult.data;
    console.log("Code d'invitation reçu:", inviteCode);

    // Dans un environnement de production, vous vérifieriez le code d'invitation
    // dans votre base de données. Pour ce prototype, on va simuler la vérification
    // en acceptant n'importe quel code et en associant l'utilisateur à une maison existante.

    // Trouver une maison à laquelle associer l'utilisateur (pour le prototype)
    console.log("Recherche d'une maison existante...");
    const house = await prisma.house.findFirst();

    if (!house) {
      console.log("Aucune maison trouvée dans la base de données!");
      return res.status(404).json({
        message:
          "Aucune maison trouvée. Veuillez créer une maison ou demander un nouveau code.",
      });
    }
    console.log("Maison trouvée:", house);

    // Récupérer le rôle USER
    console.log("Récupération du rôle USER...");
    const userRole = await prisma.userRole.findFirst({
      where: { name: "USER" },
    });

    if (!userRole) {
      console.log("Rôle USER non trouvé!");
      return res.status(500).json({
        message: "Erreur lors de l'attribution du rôle utilisateur",
      });
    }
    console.log("Rôle USER trouvé avec ID:", userRole.id);

    // Mettre à jour l'utilisateur
    console.log(`Mise à jour de l'utilisateur ID: ${req.user.id}`);
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        houseId: house.id,
        roleId: userRole.id,
      },
      include: {
        house: true,
        role: true,
      },
    });
    console.log(
      "Utilisateur mis à jour avec succès, nouveau rôle:",
      updatedUser.role.name
    );

    res.status(200).json({
      message: "Vous avez rejoint la maison avec succès",
      house,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la tentative de rejoindre la maison:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
  console.log("==== FIN JOIN HOUSE ====");
};

// Obtenir les membres d'une maison
export const getHouseMembers = async (req: AuthRequest, res: Response) => {
  console.log("==== DÉBUT GET HOUSE MEMBERS ====");
  console.log("User ID from token:", req.user.id);
  console.log("House ID:", req.params.id);

  try {
    const houseId = parseInt(req.params.id);

    // Vérifier si l'utilisateur a accès à cette maison
    console.log(
      `Vérification des droits d'accès pour l'utilisateur ID: ${req.user.id}`
    );
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      console.log(`Utilisateur ID ${req.user.id} non trouvé!`);
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette maison",
      });
    }

    if (user.houseId !== houseId) {
      console.log(
        `L'utilisateur ID ${req.user.id} n'appartient pas à la maison ID ${houseId}!`
      );
      console.log(`House ID de l'utilisateur: ${user.houseId}`);
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette maison",
      });
    }

    // Récupérer tous les membres de la maison
    console.log(`Récupération des membres de la maison ID: ${houseId}`);
    const members = await prisma.user.findMany({
      where: { houseId },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        description: true,
        roleId: true,
        role: true,
      },
    });
    console.log(`${members.length} membre(s) trouvé(s)`);

    res.status(200).json(members);
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
  console.log("==== FIN GET HOUSE MEMBERS ====");
};
