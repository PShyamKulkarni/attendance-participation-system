import Navbar from "@/app/components/Navbar";
import { ensureApplicationUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export default async function DashboardPage() {
  const user = await ensureApplicationUser();

  // =========================
  // STUDENT DASHBOARD
  // =========================

  if (user.role === UserRole.STUDENT) {
    const activeSessions = await prisma.attendanceSession.findMany({
      where: {
        status: "ACTIVE",
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gt: new Date(),
        },
        course: {
          enrollments: {
            some: {
              studentId: user.id,
            },
          },
        },
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        startsAt: "desc",
      },
    });

    const completedAttendance = await prisma.attendanceRecord.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        session: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        verifiedAt: "desc",
      },
      take: 10,
    });

    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="mx-auto max-w-7xl p-8">
          <h1 className="text-3xl font-bold">
            Student Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Welcome, {user.name ?? user.email}
          </p>

          {/* Active Sessions */}

          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">
              Ongoing Sessions
            </h2>

            <div className="overflow-x-auto border border-gray-700">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 bg-black">
                    <th className="p-4">Subject</th>
                    <th className="p-4">Course Code</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Started</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {activeSessions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-gray-400"
                      >
                        No ongoing sessions.
                      </td>
                    </tr>
                  ) : (
                    activeSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-gray-800"
                      >
                        <td className="p-4">
                          {session.course.name}
                        </td>

                        <td className="p-4">
                          {session.course.code}
                        </td>

                        <td className="p-4">
                          {session.course.instructor.name ??
                            session.course.instructor.email}
                        </td>

                        <td className="p-4">
                          {session.startsAt.toLocaleTimeString()}
                        </td>

                        <td className="p-4">
                          ONGOING
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Completed Sessions */}

          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">
              Completed Sessions
            </h2>

            <div className="overflow-x-auto border border-gray-700">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 bg-black">
                    <th className="p-4">Date</th>
                    <th className="p-4">Session Code</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Attendance</th>
                  </tr>
                </thead>

                <tbody>
                  {completedAttendance.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-gray-400"
                      >
                        No completed sessions yet.
                      </td>
                    </tr>
                  ) : (
                    completedAttendance.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-800"
                      >
                        <td className="p-4">
                          {record.verifiedAt.toLocaleDateString()}
                        </td>

                        <td className="p-4">
                          {record.session.id.slice(-6)}
                        </td>

                        <td className="p-4">
                          {record.session.course.name}
                        </td>

                        <td className="p-4">
                          {record.session.course.instructor.name ??
                            record.session.course.instructor.email}
                        </td>

                        <td className="p-4">
                          VERIFIED
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

  // =========================
  // INSTRUCTOR DASHBOARD
  // =========================

  if (user.role === UserRole.INSTRUCTOR) {
    const courses = await prisma.course.findMany({
      where: {
        instructorId: user.id,
      },
      orderBy: {
        code: "asc",
      },
    });

    const activeSessions = await prisma.attendanceSession.findMany({
      where: {
        instructorId: user.id,
        status: "ACTIVE",
        endsAt: {
          gt: new Date(),
        },
      },
      include: {
        course: true,
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: {
        startsAt: "desc",
      },
    });

    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="mx-auto max-w-7xl p-8">
          <h1 className="text-3xl font-bold">
            Instructor Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Welcome, {user.name ?? user.email}
          </p>

          {/* Courses */}

          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">
              My Courses
            </h2>

            <div className="overflow-x-auto border border-gray-700">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-4">Course Code</th>
                    <th className="p-4">Subject</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-gray-800"
                    >
                      <td className="p-4">{course.code}</td>
                      <td className="p-4">{course.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ongoing Sessions */}

          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">
              Ongoing Sessions
            </h2>

            <div className="overflow-x-auto border border-gray-700">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-4">Subject</th>
                    <th className="p-4">Session</th>
                    <th className="p-4">Started</th>
                    <th className="p-4">Attendance</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {activeSessions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-gray-400"
                      >
                        No ongoing sessions.
                      </td>
                    </tr>
                  ) : (
                    activeSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-gray-800"
                      >
                        <td className="p-4">
                          {session.course.name}
                        </td>

                        <td className="p-4">
                          {session.id.slice(-6)}
                        </td>

                        <td className="p-4">
                          {session.startsAt.toLocaleTimeString()}
                        </td>

                        <td className="p-4">
                          {session._count.attendance}
                        </td>

                        <td className="p-4">
                          ONGOING
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

  // =========================
  // ADMIN DASHBOARD
  // =========================

  const [
    instructorCount,
    studentCount,
    courseCount,
    sessionCount,
    activeSessions,
    instructors,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: UserRole.INSTRUCTOR,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.STUDENT,
      },
    }),

    prisma.course.count(),

    prisma.attendanceSession.count(),

    prisma.attendanceSession.findMany({
      where: {
        status: "ACTIVE",
        endsAt: {
          gt: new Date(),
        },
      },
      include: {
        course: true,
        instructor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startsAt: "desc",
      },
    }),

    prisma.user.findMany({
      where: {
        role: UserRole.INSTRUCTOR,
      },
      include: {
        taughtCourses: true,
        sessions: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-400">
          System overview
        </p>

        {/* Statistics */}

        <section className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="border border-gray-700 p-6">
            <p className="text-gray-400">Instructors</p>
            <p className="mt-2 text-3xl font-bold">
              {instructorCount}
            </p>
          </div>

          <div className="border border-gray-700 p-6">
            <p className="text-gray-400">Students</p>
            <p className="mt-2 text-3xl font-bold">
              {studentCount}
            </p>
          </div>

          <div className="border border-gray-700 p-6">
            <p className="text-gray-400">Courses</p>
            <p className="mt-2 text-3xl font-bold">
              {courseCount}
            </p>
          </div>

          <div className="border border-gray-700 p-6">
            <p className="text-gray-400">Total Sessions</p>
            <p className="mt-2 text-3xl font-bold">
              {sessionCount}
            </p>
          </div>
        </section>

        {/* Ongoing Sessions */}

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">
            Ongoing Sessions
          </h2>

          <div className="overflow-x-auto border border-gray-700">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4">Subject</th>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Session</th>
                  <th className="p-4">Started</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {activeSessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-gray-400"
                    >
                      No ongoing sessions.
                    </td>
                  </tr>
                ) : (
                  activeSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-gray-800"
                    >
                      <td className="p-4">
                        {session.course.name}
                      </td>

                      <td className="p-4">
                        {session.instructor.name ??
                          session.instructor.email}
                      </td>

                      <td className="p-4">
                        {session.id.slice(-6)}
                      </td>

                      <td className="p-4">
                        {session.startsAt.toLocaleTimeString()}
                      </td>

                      <td className="p-4">
                        ONGOING
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Instructor Information */}

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">
            Instructor Information
          </h2>

          <div className="overflow-x-auto border border-gray-700">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Courses</th>
                  <th className="p-4">Sessions</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {instructors.map((instructor) => (
                  <tr
                    key={instructor.id}
                    className="border-b border-gray-800"
                  >
                    <td className="p-4">
                      {instructor.name ?? "Not provided"}
                    </td>

                    <td className="p-4">
                      {instructor.email}
                    </td>

                    <td className="p-4">
                      {instructor.taughtCourses.length}
                    </td>

                    <td className="p-4">
                      {instructor.sessions.length}
                    </td>

                    <td className="p-4">
                      {instructor.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}