import { UserRole, UserStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await requireRole([UserRole.ADMIN]);

  const body = await request.json();

  const courseId = body.courseId;
  const studentId = body.studentId;

  if (
    typeof courseId !== "string" ||
    typeof studentId !== "string" ||
    !courseId ||
    !studentId
  ) {
    return Response.json(
      {
        error: "courseId and studentId are required",
      },
      { status: 400 },
    );
  }

  const [course, student] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            adminId: true,
          },
        },
      },
    }),

    prisma.user.findUnique({
      where: { id: studentId },
    }),
  ]);

  if (!course) {
    return Response.json(
      { error: "Course not found" },
      { status: 404 },
    );
  }

  if (!student) {
    return Response.json(
      { error: "Student not found" },
      { status: 404 },
    );
  }

  if (
    student.role !== UserRole.STUDENT ||
    student.status !== UserStatus.VERIFIED
  ) {
    return Response.json(
      {
        error: "Student must be verified before enrollment",
      },
      { status: 400 },
    );
  }

  if (course.instructor.adminId !== admin.id) {
    return Response.json(
      {
        error: "Course does not belong to your organization",
      },
      { status: 403 },
    );
  }

  if (student.adminId !== admin.id) {
    return Response.json(
      {
        error: "Student does not belong to your organization",
      },
      { status: 403 },
    );
  }

  const existingEnrollment =
    await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

  if (existingEnrollment) {
    return Response.json(
      {
        error: "Student is already enrolled in this course",
      },
      { status: 409 },
    );
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId,
      courseId,
    },
    select: {
      id: true,
      studentId: true,
      courseId: true,
      createdAt: true,
    },
  });

  return Response.json(enrollment, {
    status: 201,
  });
}