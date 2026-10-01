import { auth } from "@clerk/nextjs/server";
import { UserRole, UserStatus } from "@prisma/client";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function hashAdminCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const code = String(body.code ?? "").trim().toUpperCase();

    if (!code) {
      return Response.json(
        { error: "Organization code is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return Response.json(
        { error: "Application user not found" },
        { status: 404 }
      );
    }

    if (user.role !== UserRole.STUDENT && user.role !== UserRole.INSTRUCTOR) {
      return Response.json(
        { error: "Only students and instructors can join an organization" },
        { status: 403 }
      );
    }

    if (user.status !== UserStatus.VERIFIED) {
      return Response.json(
        { error: "Your account is not verified" },
        { status: 403 }
      );
    }

    const codeHash = hashAdminCode(code);

    const admin = await prisma.user.findUnique({
      where: {
        adminCodeHash: codeHash,
      },
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      return Response.json(
        { error: "Invalid organization code" },
        { status: 400 }
      );
    }

    if (admin.status !== UserStatus.VERIFIED) {
      return Response.json(
        { error: "This organization is not currently available" },
        { status: 400 }
      );
    }

    if (user.adminId === admin.id) {
      return Response.json(
        { message: "You are already a member of this organization" },
        { status: 200 }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        adminId: admin.id,
      },
    });

    return Response.json({
      message: "Successfully joined the organization",
    });
  } catch (error) {
    console.error("Organization join error:", error);

    return Response.json(
      { error: "Something went wrong while joining the organization" },
      { status: 500 }
    );
  }
}