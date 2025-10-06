"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate inputs
  if (!username || !email || !password) {
    throw new Error("All fields are required");
  }

  // Check if username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
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

  // Create user
  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  // Redirect to sign in page
  redirect("/signin?registered=true");
}
