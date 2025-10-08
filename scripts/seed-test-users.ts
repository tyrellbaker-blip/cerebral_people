import { PrismaClient, UserRole, UserStatus, ProfileType, CPSubtype, GMFCS, MobilityAid, AssistiveTech, CommMode, Transport } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "SHADOWBANNED", "DELETED"];
const ROLES: UserRole[] = ["MEMBER", "MODERATOR", "ADMIN"];
const PROFILE_TYPES: ProfileType[] = ["NORMAL", "DOCTOR", "PT", "PARENT"];
const CP_SUBTYPES: CPSubtype[] = ["SPASTIC", "DYSKINETIC", "ATAXIC", "MIXED", "UNKNOWN"];
const GMFCS_LEVELS: GMFCS[] = ["I", "II", "III", "IV", "V", "UNKNOWN"];
const MOBILITY_AIDS: MobilityAid[] = ["NONE", "CANE", "WALKER", "MANUAL_CHAIR", "POWER_CHAIR", "ANKLE_FOOT_ORTHOSIS"];
const ASSISTIVE_TECH: AssistiveTech[] = ["SPEECH_DEVICE", "EYETRACKER", "SWITCH_CONTROL", "VOICE_CONTROL", "SCREEN_READER"];
const COMM_MODES: CommMode[] = ["TYPING", "VOICE", "TEXT_TO_SPEECH", "AAC"];
const TRANSPORTS: Transport[] = ["PUBLIC_TRANSIT", "RIDE_SHARE", "ADAPTED_VAN", "PARATRANSIT", "FAMILY"];

async function seedUsers() {
  console.log("🌱 Starting to seed test users...");

  // Create 30 test users with varied data
  const userCount = 30;
  const createdUsers: Array<{
    id: string;
    username: string | null;
    email: string | null;
    role: UserRole;
    status: UserStatus;
    profileType: ProfileType;
  }> = [];

  for (let i = 0; i < userCount; i++) {
    const status = faker.helpers.arrayElement(STATUSES);
    const role = faker.helpers.arrayElement(ROLES);
    const profileType = faker.helpers.arrayElement(PROFILE_TYPES);

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Create user
    const user = await prisma.user.create({
      data: {
        username: `test_${username}`,
        email: `test_${email}`,
        name: `${firstName} ${lastName}`,
        emailVerified: faker.datatype.boolean() ? faker.date.past() : null,
        role,
        status,
        lastLoginAt: faker.datatype.boolean() ? faker.date.recent() : null,
        suspendedUntil: status === "SUSPENDED" ? faker.date.future() : null,
        suspensionReason: status === "SUSPENDED" || status === "SHADOWBANNED" || status === "DELETED"
          ? faker.helpers.arrayElement([
              "Violation of community guidelines",
              "Spam behavior detected",
              "Harassment of other users",
              "Test suspension for demo",
              "Multiple policy violations"
            ])
          : null,
      },
    });

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        displayName: faker.datatype.boolean() ? `${firstName} ${lastName[0]}.` : null,
        pronouns: faker.helpers.arrayElement(["he/him", "she/her", "they/them", null]),
        bio: faker.datatype.boolean() ? faker.lorem.paragraph(2) : null,
        region: faker.datatype.boolean() ? `${faker.location.city()}, ${faker.location.state()}` : null,
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.location.zipCode(),
        profileType,
        isVerified: profileType !== "NORMAL" ? faker.datatype.boolean() : false,
        verifiedAt: profileType !== "NORMAL" && faker.datatype.boolean() ? faker.date.past() : null,
        cpSubtype: faker.helpers.arrayElement(CP_SUBTYPES),
        gmfcs: faker.helpers.arrayElement(GMFCS_LEVELS),
        mobilityAids: faker.helpers.arrayElements(MOBILITY_AIDS, { min: 0, max: 3 }),
        assistiveTech: faker.helpers.arrayElements(ASSISTIVE_TECH, { min: 0, max: 2 }),
        commModes: faker.helpers.arrayElements(COMM_MODES, { min: 1, max: 3 }),
        exerciseTolerance: faker.number.int({ min: 1, max: 5 }),
        transport: faker.helpers.arrayElement(TRANSPORTS),
        credentials: profileType === "DOCTOR" || profileType === "PT"
          ? JSON.stringify({
              licenseNumber: faker.string.alphanumeric(10).toUpperCase(),
              state: faker.location.state(),
              expirationDate: faker.date.future().toISOString()
            })
          : null,
      },
    });

    // Create 0-3 posts for some active users
    if (status === "ACTIVE" && faker.datatype.boolean(0.6)) {
      const postCount = faker.number.int({ min: 0, max: 3 });
      for (let j = 0; j < postCount; j++) {
        const post = await prisma.post.create({
          data: {
            authorId: user.id,
            body: faker.lorem.paragraph(faker.number.int({ min: 1, max: 3 })),
            postType: faker.helpers.arrayElement(["GENERAL", "ASSISTIVE_WIN", "QUESTION"]),
            energyLevel: faker.number.int({ min: 1, max: 4 }),
            createdAt: faker.date.recent({ days: 30 }),
          },
        });

        // Add 0-2 comments to some posts
        if (faker.datatype.boolean(0.4)) {
          const commentCount = faker.number.int({ min: 0, max: 2 });
          for (let k = 0; k < commentCount; k++) {
            await prisma.comment.create({
              data: {
                postId: post.id,
                authorId: user.id,
                body: faker.lorem.sentence(),
                createdAt: faker.date.recent({ days: 25 }),
              },
            });
          }
        }
      }
    }

    createdUsers.push({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      profileType: profile.profileType,
    });

    console.log(`✓ Created user ${i + 1}/${userCount}: ${user.username} (${role}, ${status}, ${profileType})`);
  }

  console.log("\n📊 Summary of created users:");

  // Count by status
  const statusCounts = STATUSES.map(status => ({
    status,
    count: createdUsers.filter(u => u.status === status).length
  }));
  console.log("\nBy Status:");
  statusCounts.forEach(({ status, count }) => console.log(`  ${status}: ${count}`));

  // Count by role
  const roleCounts = ROLES.map(role => ({
    role,
    count: createdUsers.filter(u => u.role === role).length
  }));
  console.log("\nBy Role:");
  roleCounts.forEach(({ role, count }) => console.log(`  ${role}: ${count}`));

  // Count by profile type
  const profileTypeCounts = PROFILE_TYPES.map(type => ({
    type,
    count: createdUsers.filter(u => u.profileType === type).length
  }));
  console.log("\nBy Profile Type:");
  profileTypeCounts.forEach(({ type, count }) => console.log(`  ${type}: ${count}`));

  // Get post and comment counts
  const postCount = await prisma.post.count();
  const commentCount = await prisma.comment.count();
  console.log(`\n📝 Created ${postCount} posts and ${commentCount} comments`);

  console.log("\n✅ Seeding complete!");
  console.log(`\n🔍 You can now test the admin panel at http://localhost:3001/admin-login`);
}

async function clearTestUsers() {
  console.log("🗑️  Clearing existing test users...");

  // Delete in order to respect foreign key constraints
  await prisma.comment.deleteMany({
    where: {
      author: {
        username: {
          startsWith: "test_"
        }
      }
    }
  });

  await prisma.post.deleteMany({
    where: {
      author: {
        username: {
          startsWith: "test_"
        }
      }
    }
  });

  await prisma.profile.deleteMany({
    where: {
      user: {
        username: {
          startsWith: "test_"
        }
      }
    }
  });

  const deleted = await prisma.user.deleteMany({
    where: {
      username: {
        startsWith: "test_"
      }
    }
  });

  console.log(`✓ Deleted ${deleted.count} test users and their data\n`);
}

async function main() {
  try {
    // Check if --clear flag is passed
    const shouldClear = process.argv.includes("--clear");
    const shouldKeep = process.argv.includes("--keep");

    if (shouldClear) {
      await clearTestUsers();
      console.log("✅ Test users cleared. Exiting.");
      return;
    }

    if (!shouldKeep) {
      // Clear existing test users first by default
      await clearTestUsers();
    }

    // Seed new users
    await seedUsers();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
