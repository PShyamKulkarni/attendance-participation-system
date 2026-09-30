import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";

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

async function main() {
  const clerkUserId =
    process.env.BOOTSTRAP_INSTRUCTOR_CLERK_USER_ID;

  if (!clerkUserId) {
    throw new Error(
      "BOOTSTRAP_INSTRUCTOR_CLERK_USER_ID is not defined",
    );
  }

  const user = await prisma.user.update({
    where: {
      clerkUserId,
    },
    data: {
      role: UserRole.INSTRUCTOR,
      status: UserStatus.VERIFIED,
    },
  });

  console.log("Bootstrap instructor configured:");
  console.log({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });