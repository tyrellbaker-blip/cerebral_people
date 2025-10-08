"use server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function changePasswordAction(prevState: any, formData: FormData) {
  const { admin } = await requireAdminAuth();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  try {
    // Fetch current admin with password
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: admin.id },
    });

    if (!currentAdmin) {
      return { error: "Admin not found" };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      currentAdmin.password
    );

    if (!isCurrentPasswordValid) {
      return { error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Invalidate all sessions except current one (for security)
    // You could optionally keep only the current session

    return { success: "Password changed successfully" };
  } catch (error) {
    console.error("Password change error:", error);
    return { error: "An error occurred while changing password" };
  }
}
