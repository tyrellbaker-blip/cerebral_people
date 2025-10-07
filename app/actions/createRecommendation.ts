"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  kind: z.enum(["DOCTOR", "FACILITY", "EXERCISE", "DIET", "DEVICE"]),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  region: z.string().max(100).optional(),
  url: z.string().url().optional().or(z.literal("")),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function createRecommendation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Parse meta if it exists
  let meta = undefined;
  const metaStr = formData.get("meta")?.toString();
  if (metaStr) {
    try {
      meta = JSON.parse(metaStr);
    } catch {
      throw new Error("Invalid meta JSON");
    }
  }

  const parsed = schema.parse({
    kind: String(formData.get("kind") || ""),
    title: String(formData.get("title") || ""),
    body: String(formData.get("body") || ""),
    region: formData.get("region") ? String(formData.get("region")) : undefined,
    url: formData.get("url") ? String(formData.get("url")) : undefined,
    meta,
  });

  await prisma.recommendation.create({
    data: {
      authorId: userId,
      kind: parsed.kind,
      title: parsed.title,
      body: parsed.body,
      region: parsed.region,
      url: parsed.url || undefined,
      meta: (parsed.meta as Prisma.JsonValue) || Prisma.JsonNull,
    },
  });

  revalidatePath("/recommendations");
}
