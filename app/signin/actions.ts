"use server";

import { signIn } from "@/app/api/auth/[...nextauth]/route";

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;

  await signIn("email", {
    email,
    redirect: false,
  });
}

export async function signInWithCredentials(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const result = await signIn("credentials", {
    username,
    password,
    redirectTo: "/feed",
  });

  if (result?.error) {
    throw new Error("Invalid credentials");
  }
}