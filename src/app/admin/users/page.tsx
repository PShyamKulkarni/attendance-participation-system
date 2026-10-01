import Navbar from "@/app/components/Navbar";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import UserActions from "./UserActions";

export default async function AdminUsersPage() {
  await requireRole([UserRole.ADMIN]);

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      adminId: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="mt-2 text-gray-400">
            View users registered in the application.
          </p>
        </div>

        <div className="overflow-x-auto border border-gray-700">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Organization</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-800"
                >
                  <td className="px-5 py-4">
                    {user.name ?? "Not provided"}
                  </td>

                  <td className="px-5 py-4">
                    {user.email}
                  </td>

                  <td className="px-5 py-4">
                    {user.role}
                  </td>

                  <td className="px-5 py-4">
                    {user.status}
                  </td>

                  <td className="px-5 py-4">
                    {user.adminId ? "Linked" : "Not linked"}
                  </td>

                  <td className="px-5 py-4">
                    <UserActions
                    userId={user.id}
                    status={user.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}