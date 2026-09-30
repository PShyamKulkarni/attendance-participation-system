import { auth } from "@clerk/nextjs/server";
import { UserRole, UserStatus } from "@prisma/client";
import { prisma } from "./prisma";

export async function requireUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("Application user not found");
  }

  return user;
}

export async function requireVerifiedUser() {
  const user = await requireUser();

  if (user.status !== UserStatus.VERIFIED) {
    throw new Error("User is not verified");
  }

  return user;
}

export async function requireRole(
  allowedRoles: UserRole[],
) {
  const user = await requireVerifiedUser();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}