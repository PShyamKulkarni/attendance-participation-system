import Navbar from "@/app/components/Navbar";
import { ensureApplicationUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export default async function CalendarPage() {
  const user = await ensureApplicationUser();

  const attendance =
    user.role === UserRole.STUDENT
      ? await prisma.attendanceRecord.findMany({
          where: {
            studentId: user.id,
          },
          include: {
            session: {
              include: {
                course: true,
              },
            },
          },
          orderBy: {
            verifiedAt: "desc",
          },
        })
      : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl p-8">

        <h1 className="text-3xl font-bold">
          Calendar
        </h1>

        <p className="mt-2 text-gray-400">
          Attendance activity by date
        </p>

        {/* Calendar placeholder */}

        <section className="mt-10 border border-gray-700 p-6">

          <h2 className="text-xl font-bold">
            October 2026
          </h2>

          <div className="mt-6 grid grid-cols-7 border-l border-t border-gray-700">

            {[
              "MON",
              "TUE",
              "WED",
              "THU",
              "FRI",
              "SAT",
              "SUN",
            ].map((day) => (
              <div
                key={day}
                className="border-b border-r border-gray-700 p-3 text-center font-bold"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, index) => {
              const day = index + 1;

              return (
                <div
                  key={day}
                  className="min-h-20 border-b border-r border-gray-700 p-3"
                >
                  <span className="text-sm">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Attendance activity */}

        <section className="mt-10">

          <h2 className="mb-4 text-xl font-bold">
            Attendance Activity
          </h2>

          <div className="overflow-x-auto border border-gray-700">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4">Date</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Course Code</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>

                {attendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-gray-400"
                    >
                      No attendance records.
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-800"
                    >
                      <td className="p-4">
                        {record.verifiedAt.toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        {record.session.course.name}
                      </td>

                      <td className="p-4">
                        {record.session.course.code}
                      </td>

                      <td className="p-4">
                        PRESENT
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}