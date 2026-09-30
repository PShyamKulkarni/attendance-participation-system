import { UserRole, UserStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CourseForm from "./CourseForm";
import EnrollmentForm from "./EnrollmentForm";

export default async function AdminCoursesPage() {
  const admin = await requireRole([UserRole.ADMIN]);

  const [courses, instructors, students] = await Promise.all([
    prisma.course.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        instructor: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),

    prisma.user.findMany({
      where: {
        role: UserRole.INSTRUCTOR,
        status: UserStatus.VERIFIED,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { createdAt: "asc" },
    }),

    prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        status: UserStatus.VERIFIED,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Admin — Course Management</h1>

      <p className="mt-4">Signed in as: {admin.email}</p>

      <CourseForm instructors={instructors} />
      <EnrollmentForm
       courses={courses.map((course) => ({
        id: course.id,
        name: course.name,
        code: course.code,
       }))}
       students={students}
    />

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left">
                Course
              </th>
              <th className="border border-gray-300 p-3 text-left">
                Code
              </th>
              <th className="border border-gray-300 p-3 text-left">
                Instructor
              </th>
              <th className="border border-gray-300 p-3 text-left">
                Students
              </th>
              <th className="border border-gray-300 p-3 text-left">
                Sessions
              </th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="border border-gray-300 p-3">
                  {course.name}
                </td>

                <td className="border border-gray-300 p-3">
                  {course.code}
                </td>

                <td className="border border-gray-300 p-3">
                  {course.instructor.name ?? course.instructor.email}
                </td>

                <td className="border border-gray-300 p-3">
                  {course._count.enrollments}
                </td>

                <td className="border border-gray-300 p-3">
                  {course._count.sessions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <p className="mt-6 text-gray-600">
            No courses have been created yet.
          </p>
        )}
      </div>
    </main>
  );
}