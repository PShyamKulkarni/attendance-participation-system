import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireRole([UserRole.ADMIN]);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return Response.json(users);
}

export async function POST(request: Request) {
  const admin = await requireRole([UserRole.ADMIN]);

  const body = await request.json();

  const userId = body.userId;

  if (typeof userId !== "string" || !userId) {
    return Response.json(
      { error: "A valid userId is required" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return Response.json(
      { error: "User not found" },
      { status: 404 },
    );
  }

  if (user.status !== "PENDING") {
    return Response.json(
      { error: "Only pending users can be verified" },
      { status: 400 },
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: "VERIFIED",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "USER_VERIFIED",
      entityType: "User",
      entityId: updatedUser.id,
      metadata: {
        email: updatedUser.email,
      },
    },
  });

  return Response.json({
    message: "User verified successfully",
    user: updatedUser,
  });
}