import { NextResponse } from "next/server";
import { UserRole, UserStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const admin = await requireRole([UserRole.ADMIN]);

    const body = await request.json();
    const userId = body.userId;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (targetUser.id === admin.id) {
      return NextResponse.json(
        { error: "Admin cannot verify their own account" },
        { status: 400 }
      );
    }

    if (
      targetUser.role !== UserRole.STUDENT &&
      targetUser.role !== UserRole.INSTRUCTOR
    ) {
      return NextResponse.json(
        { error: "Only students and instructors can be verified" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: targetUser.id,
      },
      data: {
        status: UserStatus.VERIFIED,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: "USER_VERIFIED",
        entityType: "USER",
        entityId: updatedUser.id,
        metadata: {
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to verify user" },
      { status: 500 }
    );
  }
}