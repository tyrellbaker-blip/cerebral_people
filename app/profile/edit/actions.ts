"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { recalcBadges } from "@/app/actions/badges";
import { DEFAULT_VIS } from "@/lib/profile";

const FIELDS = [
  "displayName",
  "pronouns",
  "bio",
  "region",
  "cpSubtype",
  "gmfcs",
  "mobilityAids",
  "assistiveTech",
  "commModes",
  "exerciseTolerance",
  "bestTimes",
  "transport",
  "a11yPrefs",
] as const;

export async function updateProfileAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update your profile");
  }

  const userId = session.user.id;

  // Basic fields
  const displayName = formData.get("displayName")?.toString() || null;
  const pronouns = formData.get("pronouns")?.toString() || null;
  const bio = formData.get("bio")?.toString() || null;
  const region = formData.get("region")?.toString() || null;

  // CP-specific fields
  const cpSubtype = formData.get("cpSubtype")?.toString() || "UNKNOWN";
  const gmfcs = formData.get("gmfcs")?.toString() || "UNKNOWN";
  const mobilityAids = formData.getAll("mobilityAids").map(String);
  const assistiveTech = formData.getAll("assistiveTech").map(String);
  const commModes = formData.getAll("commModes").map(String);
  const exerciseTolerance = Number(formData.get("exerciseTolerance") || 3);
  const bestTimes = formData.getAll("bestTimes").map(String);
  const transport = formData.get("transport")?.toString() || "OTHER";

  // Accessibility preferences
  const a11yPrefs = {
    fontSize: formData.get("fontSize")?.toString() || "md",
    contrast: formData.get("contrast") === "high",
    reduceMotion: formData.get("reduceMotion") === "true",
    dyslexiaFont: formData.get("dyslexiaFont") === "true",
  };

  // Visibility map
  const visibility: Record<string, string> = {};
  for (const field of FIELDS) {
    const visValue = formData.get(`vis:${field}`)?.toString() || "PUBLIC";
    visibility[field] = visValue;
  }

  // Validate required fields
  if (!displayName) {
    throw new Error("Display name is required");
  }

  // Upsert profile
  await prisma.profile.upsert({
    where: { userId },
    update: {
      displayName,
      pronouns,
      bio,
      region,
      cpSubtype: cpSubtype as any,
      gmfcs: gmfcs as any,
      mobilityAids: mobilityAids as any[],
      assistiveTech: assistiveTech as any[],
      commModes: commModes as any[],
      exerciseTolerance,
      bestTimes,
      transport: transport as any,
      a11yPrefs,
      visibility,
    },
    create: {
      userId,
      displayName,
      pronouns,
      bio,
      region,
      cpSubtype: cpSubtype as any,
      gmfcs: gmfcs as any,
      mobilityAids: mobilityAids as any[],
      assistiveTech: assistiveTech as any[],
      commModes: commModes as any[],
      exerciseTolerance,
      bestTimes,
      transport: transport as any,
      a11yPrefs,
      visibility,
      badges: ["18_PLUS"],
    },
  });

  // Recalculate badges
  await recalcBadges();

  redirect("/profile");
}