import crypto from "node:crypto";

import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashVerificationCode(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

export async function POST(request: Request) {
  const instructor = await requireRole([UserRole.INSTRUCTOR]);

  const body = await request.json();

  const courseId = body.courseId;

  if (typeof courseId !== "string" || !courseId) {
    return Response.json(
      { error: "courseId is required" },
      { status: 400 },
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return Response.json(
      { error: "Course not found" },
      { status: 404 },
    );
  }

  if (course.instructorId !== instructor.id) {
    return Response.json(
      {
        error:
          "You are not authorized to create a session for this course",
      },
      { status: 403 },
    );
  }

  const now = new Date();

  const endsAt = new Date(
    now.getTime() + 60 * 60 * 1000,
  );

  const codeExpiresAt = new Date(
    now.getTime() + 10 * 60 * 1000,
  );

  const verificationCode = generateVerificationCode();
  const verificationCodeHash =
    hashVerificationCode(verificationCode);

  const session = await prisma.attendanceSession.create({
    data: {
      courseId: course.id,
      instructorId: instructor.id,
      startsAt: now,
      endsAt,
      verificationCodeHash,
      codeExpiresAt,
    },
    select: {
      id: true,
      courseId: true,
      startsAt: true,
      endsAt: true,
      codeExpiresAt: true,
      status: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: instructor.id,
      action: "ATTENDANCE_VERIFICATION_ATTEMPTED",
      entityType: "AttendanceSession",
      entityId: session.id,
      metadata: {
        event: "SESSION_CREATED",
      },
    },
  });

  return Response.json(
    {
      session,
      verificationCode,
    },
    { status: 201 },
  );
}