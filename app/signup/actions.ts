"use server";

import { prisma } from "@/lib/prisma";
import { CPSubtype, GMFCS } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { DEFAULT_VIS } from "@/lib/profile";

export async function signUpAction(formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("displayName") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const pronouns = formData.get("pronouns") as string;
    const cpSubtype = formData.get("cpSubtype") as string;
    const gmfcs = formData.get("gmfcs") as string;

    // Validate required inputs
    if (!username || !email || !password || !displayName || !dateOfBirth) {
      return { success: false, error: "All required fields must be filled" };
    }

    // Verify age is 18+
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    if (actualAge < 18) {
      return { success: false, error: "You must be 18 or older to join" };
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return { success: false, error: "Username already taken. Please choose a different username." };
      }
      if (existingUser.email === email) {
        return { success: false, error: "Email already registered. Please sign in or use a different email." };
      }
    }

    // Check if display name already exists
    const existingProfile = await prisma.profile.findFirst({
      where: { displayName },
    });

    if (existingProfile) {
      return { success: false, error: "Display name already taken. Please choose a different display name." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with profile (auto-verify email)
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
        emailVerified: new Date(), // Auto-verify for now
        profile: {
          create: {
            displayName,
            pronouns: pronouns || null,
            cpSubtype: (cpSubtype as CPSubtype) || CPSubtype.UNKNOWN,
            gmfcs: (gmfcs as GMFCS) || GMFCS.UNKNOWN,
            badges: ["18_PLUS"], // All users have confirmed 18+
            visibility: DEFAULT_VIS,
          },
        },
      },
    });

    console.log(`✅ New user registered: ${username} (${email})`);

    // Redirect to sign in page
    redirect("/signin?registered=true");
  } catch (error) {
    // Re-throw redirect errors (they're not actual errors)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error("Signup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create account. Please try again."
    };
  }
}
