"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { DEFAULT_VIS } from "@/lib/profile";

export async function signUpAction(formData: FormData) {
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
    throw new Error("All required fields must be filled");
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
    throw new Error("You must be 18 or older to join");
  }

  // Check if username or email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new Error("Username already taken");
    }
    if (existingUser.email === email) {
      throw new Error("Email already registered");
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with profile
  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      profile: {
        create: {
          displayName,
          pronouns: pronouns || null,
          cpSubtype: (cpSubtype as any) || "UNKNOWN",
          gmfcs: (gmfcs as any) || "UNKNOWN",
          badges: ["18_PLUS"], // All users have confirmed 18+
          visibility: DEFAULT_VIS as any,
        },
      },
    },
  });

  // Redirect to sign in page
  redirect("/signin?registered=true");
}
