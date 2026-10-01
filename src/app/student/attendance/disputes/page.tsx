import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DisputeForm from "./DisputeForm";

export default async function StudentDisputesPage() {
  const student = await requireRole([UserRole.STUDENT]);

  const attendance = await prisma.attendanceRecord.findMany({
    where: {
      studentId: student.id,
    },
    select: {
      id: true,
      verifiedAt: true,
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
    },
    orderBy: {
      verifiedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Attendance Disputes
      </h1>

      <p className="mt-4">
        Signed in as: {student.email}
      </p>

      <DisputeForm
        attendance={attendance.map((record) => ({
          id: record.id,
          verifiedAt: record.verifiedAt.toISOString(),
          courseName: record.session.course.name,
          courseCode: record.session.course.code,
        }))}
      />
    </main>
  );
}