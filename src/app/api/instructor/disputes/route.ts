import { DisputeStatus, UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const instructor = await requireRole([UserRole.INSTRUCTOR]);

  const disputes = await prisma.attendanceDispute.findMany({
    where: {
      session: {
        instructorId: instructor.id,
      },
    },
    select: {
      id: true,
      reason: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      student: {
        select: {
          name: true,
          email: true,
        },
      },
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
      attendanceRecord: {
        select: {
          verifiedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(disputes);
}

export async function PATCH(request: Request) {
  const instructor = await requireRole([UserRole.INSTRUCTOR]);

  const body = await request.json();

  const disputeId = body.disputeId;
  const decision = body.decision;

  if (
    typeof disputeId !== "string" ||
    typeof decision !== "string"
  ) {
    return Response.json(
      {
        error:
          "disputeId and decision are required",
      },
      { status: 400 },
    );
  }

  if (
    decision !== DisputeStatus.APPROVED &&
    decision !== DisputeStatus.REJECTED
  ) {
    return Response.json(
      {
        error:
          "Decision must be APPROVED or REJECTED",
      },
      { status: 400 },
    );
  }

  const dispute =
    await prisma.attendanceDispute.findUnique({
      where: {
        id: disputeId,
      },
      include: {
        session: {
          select: {
            instructorId: true,
            courseId: true,
          },
        },
      },
    });

  if (!dispute) {
    return Response.json(
      {
        error: "Dispute not found",
      },
      { status: 404 },
    );
  }

  if (dispute.session.instructorId !== instructor.id) {
    return Response.json(
      {
        error:
          "You are not authorized to review this dispute",
      },
      { status: 403 },
    );
  }

  if (dispute.status !== DisputeStatus.OPEN) {
    return Response.json(
      {
        error:
          "Only open disputes can be reviewed",
      },
      { status: 409 },
    );
  }

  const reviewedAt = new Date();

  const updatedDispute =
    await prisma.$transaction(async (transaction) => {
      const updated =
        await transaction.attendanceDispute.update({
          where: {
            id: dispute.id,
          },
          data: {
            status: decision,
            reviewedById: instructor.id,
            reviewedAt,
          },
        });

      await transaction.auditLog.create({
        data: {
          actorId: instructor.id,
          action:
            decision === DisputeStatus.APPROVED
              ? "DISPUTE_APPROVED"
              : "DISPUTE_REJECTED",
          entityType: "AttendanceDispute",
          entityId: dispute.id,
          metadata: {
            courseId: dispute.session.courseId,
            attendanceRecordId:
              dispute.attendanceRecordId,
          },
        },
      });

      if (
  decision === DisputeStatus.APPROVED &&
  dispute.attendanceRecordId
) {
  await transaction.auditLog.create({
    data: {
      actorId: instructor.id,
      action: "ATTENDANCE_CORRECTED",
      entityType: "AttendanceRecord",
      entityId: dispute.attendanceRecordId,
      metadata: {
        disputeId: dispute.id,
        courseId: dispute.session.courseId,
        correction: "DISPUTE_APPROVED",
      },
    },
  });
}

      return updated;
    });

  return Response.json({
    message: `Dispute ${decision.toLowerCase()} successfully`,
    dispute: updatedDispute,
  });
}