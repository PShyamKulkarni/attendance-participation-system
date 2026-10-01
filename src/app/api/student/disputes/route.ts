import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const student = await requireRole([UserRole.STUDENT]);

  const body = await request.json();

  const attendanceRecordId = body.attendanceRecordId;
  const reason = body.reason;

  if (
    typeof attendanceRecordId !== "string" ||
    typeof reason !== "string" ||
    !attendanceRecordId ||
    !reason.trim()
  ) {
    return Response.json(
      {
        error:
          "attendanceRecordId and reason are required",
      },
      { status: 400 },
    );
  }

  const attendance =
    await prisma.attendanceRecord.findUnique({
      where: {
        id: attendanceRecordId,
      },
      include: {
        session: {
          select: {
            id: true,
            courseId: true,
          },
        },
      },
    });

  if (!attendance) {
    return Response.json(
      {
        error: "Attendance record not found",
      },
      { status: 404 },
    );
  }

  if (attendance.studentId !== student.id) {
    return Response.json(
      {
        error:
          "You can only dispute your own attendance",
      },
      { status: 403 },
    );
  }

  const existingDispute =
    await prisma.attendanceDispute.findFirst({
      where: {
        attendanceRecordId: attendance.id,
        status: "OPEN",
      },
    });

  if (existingDispute) {
    return Response.json(
      {
        error:
          "An open dispute already exists for this attendance record",
      },
      { status: 409 },
    );
  }

  const dispute =
    await prisma.attendanceDispute.create({
      data: {
        sessionId: attendance.sessionId,
        studentId: student.id,
        attendanceRecordId: attendance.id,
        reason: reason.trim(),
      },
      select: {
        id: true,
        sessionId: true,
        studentId: true,
        attendanceRecordId: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });

  await prisma.auditLog.create({
    data: {
      actorId: student.id,
      action: "DISPUTE_CREATED",
      entityType: "AttendanceDispute",
      entityId: dispute.id,
      metadata: {
        attendanceRecordId: attendance.id,
        courseId: attendance.session.courseId,
      },
    },
  });

  return Response.json(
    {
      message: "Attendance dispute created successfully",
      dispute,
    },
    { status: 201 },
  );
}