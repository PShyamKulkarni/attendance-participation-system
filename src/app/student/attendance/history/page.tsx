import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentAttendanceHistoryPage() {
  const student = await requireRole([UserRole.STUDENT]);

  const attendance = await prisma.attendanceRecord.findMany({
    where: {
      studentId: student.id,
    },
    select: {
      id: true,
      verifiedAt: true,
      verificationMethod: true,
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
        My Attendance History
      </h1>

      <p className="mt-4">
        Signed in as: {student.email}
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-gray-300 p-3 text-left">
                Course
              </th>

              <th className="border border-gray-300 p-3 text-left">
                Course Code
              </th>

              <th className="border border-gray-300 p-3 text-left">
                Verified At
              </th>

              <th className="border border-gray-300 p-3 text-left">
                Method
              </th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <td className="border border-gray-300 p-3">
                  {record.session.course.name}
                </td>

                <td className="border border-gray-300 p-3">
                  {record.session.course.code}
                </td>

                <td className="border border-gray-300 p-3">
                  {record.verifiedAt.toLocaleString()}
                </td>

                <td className="border border-gray-300 p-3">
                  {record.verificationMethod}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {attendance.length === 0 && (
          <p className="mt-6 text-gray-600">
            No attendance records found.
          </p>
        )}
      </div>
    </main>
  );
}