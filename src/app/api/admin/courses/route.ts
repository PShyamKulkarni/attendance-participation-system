import { UserRole, UserStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireRole([UserRole.ADMIN]);

  const body = await request.json();

  const name = body.name;
  const code = body.code;
  const instructorId = body.instructorId;

  if (
    typeof name !== "string" ||
    typeof code !== "string" ||
    typeof instructorId !== "string" ||
    !name.trim() ||
    !code.trim() ||
    !instructorId
  ) {
    return Response.json(
      {
        error:
          "name, code, and instructorId are required",
      },
      { status: 400 },
    );
  }

  const instructor = await prisma.user.findUnique({
    where: {
      id: instructorId,
    },
  });

  if (!instructor) {
    return Response.json(
      { error: "Instructor not found" },
      { status: 404 },
    );
  }

  if (
    instructor.role !== UserRole.INSTRUCTOR ||
    instructor.status !== UserStatus.VERIFIED
  ) {
    return Response.json(
      {
        error:
          "Course instructor must be a verified instructor",
      },
      { status: 400 },
    );
  }

  const existingCourse = await prisma.course.findUnique({
    where: {
      code: code.trim(),
    },
  });

  if (existingCourse) {
    return Response.json(
      {
        error: "A course with this code already exists",
      },
      { status: 409 },
    );
  }

  const course = await prisma.course.create({
    data: {
      name: name.trim(),
      code: code.trim(),
      instructorId: instructor.id,
    },
    select: {
      id: true,
      name: true,
      code: true,
      instructorId: true,
      createdAt: true,
    },
  });

  return Response.json(course, { status: 201 });
}