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

function generateAdminCode() {
  const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const part3 = crypto.randomBytes(2).toString("hex").toUpperCase();

  return `ADM-${part1}-${part2}-${part3}`;
}

function hashAdminCode(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

async function main() {
  const clerkUserId = process.env.BOOTSTRAP_ADMIN_CLERK_USER_ID;

  if (!clerkUserId) {
    throw new Error(
      "BOOTSTRAP_ADMIN_CLERK_USER_ID is not defined"
    );
  }

  const admin = await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
  });

  if (!admin) {
    throw new Error(
      "Admin application user was not found"
    );
  }

  if (admin.role !== "ADMIN") {
    throw new Error(
      "The specified user is not an ADMIN"
    );
  }

  const code = generateAdminCode();
  const codeHash = hashAdminCode(code);

  await prisma.user.update({
    where: {
      id: admin.id,
    },
    data: {
      adminCodeHash: codeHash,
    },
  });

  console.log("\n================================");
  console.log("ADMIN ORGANIZATION CODE");
  console.log("================================");
  console.log(code);
  console.log("================================\n");
  console.log(
    "Store this code somewhere safe."
  );
  console.log(
    "Only the hashed version was stored in the database."
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