"use server";

import { loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function adminLoginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  // Get IP and User Agent
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  const result = await loginAdmin(username, password, ipAddress, userAgent);

  if (!result.success) {
    return { error: result.error };
  }

  // Redirect to admin dashboard
  redirect("/admin");
}

export async function adminLogoutAction() {
  await logoutAdmin();
  redirect("/admin-login");
}
