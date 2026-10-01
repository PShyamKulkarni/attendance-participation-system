import crypto from "node:crypto";

import {
  Prisma,
  UserRole,
} from "@prisma/client";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function hashVerificationCode(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

export async function POST(request: Request) {
  const student = await requireRole([UserRole.STUDENT]);

  const body = await request.json();

  const sessionId = body.sessionId;
  const verificationCode = body.verificationCode;

  if (
    typeof sessionId !== "string" ||
    typeof verificationCode !== "string" ||
    !sessionId ||
    !verificationCode
  ) {
    return Response.json(
      {
        error:
          "sessionId and verificationCode are required",
      },
      { status: 400 },
    );
  }

  if (!/^\d{6}$/.test(verificationCode)) {
    return Response.json(
      {
        error: "Verification code must be 6 digits",
      },
      { status: 400 },
    );
  }

  const session =
    await prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                adminId: true,
              },
            },
          },
        },
      },
    });

  if (!session) {
    return Response.json(
      {
        error: "Attendance session not found",
      },
      { status: 404 },
    );
  }

  const now = new Date();

  if (
    session.status !== "ACTIVE" ||
    now < session.startsAt ||
    now > session.endsAt
  ) {
    return Response.json(
      {
        error: "Attendance session is not active",
      },
      { status: 400 },
    );
  }

  if (now > session.codeExpiresAt) {
    return Response.json(
      {
        error: "Verification code has expired",
      },
      { status: 400 },
    );
  }

  if (
    session.course.instructor.adminId !== student.adminId
  ) {
    return Response.json(
      {
        error:
          "This attendance session does not belong to your organization",
      },
      { status: 403 },
    );
  }

  const enrollment =
    await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: session.courseId,
        },
      },
    });

  if (!enrollment) {
    return Response.json(
      {
        error:
          "You are not enrolled in this course",
      },
      { status: 403 },
    );
  }

  const submittedCodeHash =
    hashVerificationCode(verificationCode);

  if (
    submittedCodeHash !== session.verificationCodeHash
  ) {
    await prisma.auditLog.create({
      data: {
        actorId: student.id,
        action: "ATTENDANCE_VERIFICATION_ATTEMPTED",
        entityType: "AttendanceSession",
        entityId: session.id,
        metadata: {
          result: "INVALID_CODE",
        },
      },
    });

    return Response.json(
      {
        error: "Invalid verification code",
      },
      { status: 400 },
    );
  }

  const existingAttendance =
    await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
    });

  if (existingAttendance) {
    await prisma.auditLog.create({
      data: {
        actorId: student.id,
        action: "DUPLICATE_ATTENDANCE_ATTEMPT",
        entityType: "AttendanceRecord",
        entityId: existingAttendance.id,
        metadata: {
          sessionId: session.id,
        },
      },
    });

    return Response.json(
      {
        error:
          "Attendance has already been recorded for this session",
      },
      { status: 409 },
    );
  }

  try {
    const attendance =
      await prisma.$transaction(async (transaction) => {
        const record =
          await transaction.attendanceRecord.create({
            data: {
              sessionId: session.id,
              studentId: student.id,
              verificationMethod: "SESSION_CODE",
            },
          });

        await transaction.auditLog.create({
          data: {
            actorId: student.id,
            action: "ATTENDANCE_VERIFIED",
            entityType: "AttendanceRecord",
            entityId: record.id,
            metadata: {
              sessionId: session.id,
              courseId: session.courseId,
              verificationMethod: "SESSION_CODE",
            },
          },
        });

        return record;
      });

    return Response.json(
      {
        message: "Attendance verified successfully",
        attendance,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        {
          error:
            "Attendance has already been recorded for this session",
        },
        { status: 409 },
      );
    }

    throw error;
  }
}