import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const prisma = new PrismaClient();

async function main() {
  const userRoles = [
    {
      name: "NO_ROLE",
    },
    {
      name: "ADMIN",
    },
    {
      name: "MODERATOR",
    },
    {
      name: "USER",
    },
    {
      name: "INVITED",
    },
  ];

  console.log("Creating user roles...");

  const existingRoles = await prisma.userRole.count();
  if (existingRoles > 0) {
    console.log("User roles already exist. Skipping seed.");
    return;
  }

  try {
    for (const role of userRoles) {
      try {
        await prisma.userRole.create({ data: role });
        console.log(`Role '${role.name}' created successfully.`);
      } catch (error) {
        if (error.code === "P2002") {
          console.log(`User role '${role.name}' already exists. Skipping.`);
        } else {
          console.error(`Error creating user role '${role.name}':`, error);
        }
      }
    }
    console.log("All user roles created successfully.");
  } catch (error) {
    console.error("Error in role creation process:", error);
  }
}

main()
  .catch((error) => {
    console.error("Error in main function:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
