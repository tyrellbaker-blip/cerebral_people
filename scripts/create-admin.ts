import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = "admin";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existing = await prisma.admin.findUnique({
      where: { username },
    });

    if (existing) {
      console.log("❌ Admin user already exists. Updating password...");
      await prisma.admin.update({
        where: { username },
        data: { password: hashedPassword },
      });
      console.log("✅ Admin password updated!");
    } else {
      console.log("Creating new admin user...");
      await prisma.admin.create({
        data: {
          username,
          password: hashedPassword,
          email: "admin@cerebralpeople.local",
          name: "System Administrator",
          isSuperAdmin: true,
          isActive: true,
        },
      });
      console.log("✅ Admin user created!");
    }

    console.log("\nLogin credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("\nPassword hash:", hashedPassword);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
