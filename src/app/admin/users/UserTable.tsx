"use client";

import { useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  status: "PENDING" | "VERIFIED" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

type UserTableProps = {
  users: User[];
};

export default function UserTable({
  users: initialUsers,
}: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function verifyUser(userId: string) {
    setLoadingUserId(userId);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to verify user");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: "VERIFIED",
              }
            : user,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setLoadingUserId(null);
    }
  }

  return (
    <div className="mt-8">
      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left">
                Name
              </th>
              <th className="border border-gray-300 p-3 text-left">
                Email
              </th>
              <th className="border border-gray-300 p-3 text-left">
                Role
              </th>
              <th className="border border-gray-300 p-3 text-left">
                Status
              </th>
              <th className="border border-gray-300 p-3 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 p-3">
                  {user.name ?? "Not provided"}
                </td>

                <td className="border border-gray-300 p-3">
                  {user.email}
                </td>

                <td className="border border-gray-300 p-3">
                  {user.role}
                </td>

                <td className="border border-gray-300 p-3">
                  {user.status}
                </td>

                <td className="border border-gray-300 p-3">
                  {user.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => verifyUser(user.id)}
                      disabled={loadingUserId === user.id}
                      className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                      {loadingUserId === user.id
                        ? "Verifying..."
                        : "Verify"}
                    </button>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}