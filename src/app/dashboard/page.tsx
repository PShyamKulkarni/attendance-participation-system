import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  await auth.protect();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Attendance Dashboard
      </h1>

      <p className="mt-4">
        You are authenticated and can access this protected page.
      </p>
    </main>
  );
}