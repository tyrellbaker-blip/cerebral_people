import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  // If user doesn't have a username yet, redirect to edit
  if (!user?.username) {
    redirect("/profile/edit");
  }

  // Redirect to the username-based profile page
  redirect(`/profile/${user.username}`);
}
