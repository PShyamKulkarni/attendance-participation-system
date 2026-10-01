import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DisputeTable from "./DisputeTable";

export default async function InstructorDisputesPage() {
  const instructor = await requireRole([UserRole.INSTRUCTOR]);

  const disputes = await prisma.attendanceDispute.findMany({
    where: {
      session: {
        instructorId: instructor.id,
      },
    },
    select: {
      id: true,
      reason: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      student: {
        select: {
          name: true,
          email: true,
        },
      },
      session: {
        select: {
          course: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
      attendanceRecord: {
        select: {
          verifiedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedDisputes = disputes.map((dispute) => ({
    ...dispute,
    createdAt: dispute.createdAt.toISOString(),
    reviewedAt: dispute.reviewedAt?.toISOString() ?? null,
    attendanceRecord: dispute.attendanceRecord
      ? {
          verifiedAt:
            dispute.attendanceRecord.verifiedAt.toISOString(),
        }
      : null,
  }));

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Instructor — Attendance Disputes
      </h1>

      <p className="mt-4">
        Signed in as: {instructor.email}
      </p>

      <DisputeTable disputes={serializedDisputes} />
    </main>
  );
}