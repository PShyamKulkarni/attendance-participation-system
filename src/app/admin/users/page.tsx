import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserTable from "./UserTable";

export default async function AdminUsersPage() {
  const admin = await requireRole([UserRole.ADMIN]);

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

  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Admin — User Management
      </h1>

      <p className="mt-4">
        Signed in as: {admin.email}
      </p>

      <p className="mt-2">
        Role: {admin.role}
      </p>

      <UserTable users={serializedUsers} />
    </main>
  );
}