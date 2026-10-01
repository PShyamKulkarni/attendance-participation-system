import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SessionForm from "./SessionForm";

export default async function InstructorSessionsPage() {
  const instructor = await requireRole([UserRole.INSTRUCTOR]);

  const courses = await prisma.course.findMany({
    where: {
      instructorId: instructor.id,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Instructor — Attendance Sessions
      </h1>

      <p className="mt-4">
        Signed in as: {instructor.email}
      </p>

      <SessionForm courses={courses} />
    </main>
  );
}