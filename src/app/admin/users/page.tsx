import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export default async function AdminUsersPage() {
  const admin = await requireRole([UserRole.ADMIN]);

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

      <p className="mt-6">
        User management will be implemented here.
      </p>
    </main>
  );
}