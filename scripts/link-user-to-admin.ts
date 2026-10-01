import "dotenv/config";
import crypto from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function hashAdminCode(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

async function main() {
  const adminClerkUserId =
    process.env.BOOTSTRAP_ADMIN_CLERK_USER_ID;

  if (!adminClerkUserId) {
    throw new Error(
      "BOOTSTRAP_ADMIN_CLERK_USER_ID is not defined"
    );
  }

  const admin = await prisma.user.findUnique({
    where: {
      clerkUserId: adminClerkUserId,
    },
  });

  if (!admin) {
    throw new Error("Admin user was not found");
  }

  if (admin.role !== "ADMIN") {
    throw new Error("Specified user is not an ADMIN");
  }

  if (!admin.adminCodeHash) {
    throw new Error(
      "Admin does not have an organization code yet"
    );
  }

  const code = process.argv[2];

const targetClerkUserId =
  process.argv[3] ||
  process.env.BOOTSTRAP_INSTRUCTOR_CLERK_USER_ID;

if (!code || !targetClerkUserId) {
  throw new Error(
    "Admin code or target Clerk user ID is missing"
  );
}

  const codeHash = hashAdminCode(code);

  if (codeHash !== admin.adminCodeHash) {
    throw new Error("Invalid admin organization code");
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      clerkUserId: targetClerkUserId,
    },
  });

  if (!targetUser) {
    throw new Error(
      "Target application user was not found"
    );
  }

  if (
    targetUser.role !== "STUDENT" &&
    targetUser.role !== "INSTRUCTOR"
  ) {
    throw new Error(
      "Only STUDENT or INSTRUCTOR accounts can be linked"
    );
  }

  await prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      adminId: admin.id,
    },
  });

  console.log(
    `Successfully linked ${targetUser.email} to the admin organization.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });