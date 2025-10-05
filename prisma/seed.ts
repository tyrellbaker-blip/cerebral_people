import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.upsert({
    where: { email: "demo@cerebralpeople.local" },
    update: {},
    create: { email: "demo@cerebralpeople.local" },
  });

  await prisma.profile.upsert({
    where: { userId: u.id },
    update: { displayName: "Demo User" },
    create: { userId: u.id, displayName: "Demo User" },
  });

  await prisma.post.create({
    data: { authorId: u.id, body: "Welcome to Cerebral People!", visibility: "PUBLIC" }
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
