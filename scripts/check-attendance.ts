import "dotenv/config";

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

async function main() {
  const attendance = await prisma.attendanceRecord.findMany({
    orderBy: {
      verifiedAt: "desc",
    },
    take: 10,
    include: {
      student: {
        select: {
          email: true,
          name: true,
        },
      },
      session: {
        select: {
          id: true,
          course: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });

  console.log("\nAttendance Records:\n");
  console.dir(attendance, { depth: null });

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: [
          "ATTENDANCE_VERIFICATION_ATTEMPTED",
          "ATTENDANCE_VERIFIED",
          "DUPLICATE_ATTENDANCE_ATTEMPT",
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  console.log("\nAttendance Audit Logs:\n");
  console.dir(auditLogs, { depth: null });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });