import { ensureApplicationUser } from "@/lib/user";

export default async function DashboardPage() {
  const user = await ensureApplicationUser();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Attendance Dashboard
      </h1>

      <div className="mt-6 space-y-2">
        <p>
          <strong>Name:</strong> {user.name ?? "Not provided"}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

        <p>
          <strong>Status:</strong> {user.status}
        </p>
      </div>
    </main>
  );
}
