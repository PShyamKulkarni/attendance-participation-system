import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function ensureApplicationUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new Error("Authenticated user has no email address");
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ") || null;

  const user = await prisma.user.upsert({
    where: {
      clerkUserId: clerkUser.id,
    },
    update: {
      email,
      name,
    },
    create: {
      clerkUserId: clerkUser.id,
      email,
      name,
    },
  });

  return user;
}