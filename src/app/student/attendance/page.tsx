import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AttendanceForm from "./AttendanceForm";

export default async function StudentAttendancePage() {
  const student = await requireRole([UserRole.STUDENT]);

  const sessions = await prisma.attendanceSession.findMany({
    where: {
      status: "ACTIVE",
      endsAt: {
        gt: new Date(),
      },
      course: {
        enrollments: {
          some: {
            studentId: student.id,
          },
        },
      },
    },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      codeExpiresAt: true,
      course: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      startsAt: "desc",
    },
  });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Student — Attendance
      </h1>

      <p className="mt-4">
        Signed in as: {student.email}
      </p>

      <div className="mt-8 space-y-4">
        {sessions.map((session) => (
          <AttendanceForm
            key={session.id}
            session={{
              id: session.id,
              courseName: session.course.name,
              courseCode: session.course.code,
              startsAt: session.startsAt.toISOString(),
              endsAt: session.endsAt.toISOString(),
              codeExpiresAt:
                session.codeExpiresAt.toISOString(),
            }}
          />
        ))}

        {sessions.length === 0 && (
          <p className="text-gray-600">
            No active attendance sessions are available.
          </p>
        )}
      </div>
    </main>
  );
}