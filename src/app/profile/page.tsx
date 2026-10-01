import Navbar from "@/app/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import { ensureApplicationUser } from "@/lib/user";
import { UserButton } from "@clerk/nextjs";

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  const user = await ensureApplicationUser();

  if (!clerkUser) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold">User Information</h1>

        <div className="border border-gray-700 bg-black p-8">
          <div className="mb-8 flex items-center justify-between border-b border-gray-700 pb-6">
            <div>
              <h2 className="text-xl font-semibold">Account</h2>
              <p className="mt-1 text-gray-400">
                Clerk authentication information
              </p>
            </div>

            <UserButton />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="mt-1 text-lg">{user.name ?? "Not provided"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Role</p>
              <p className="mt-1 text-lg">{user.role}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Account Status</p>
              <p className="mt-1 text-lg">{user.status}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Clerk User ID</p>
              <p className="mt-1 break-all font-mono text-sm">
                {clerkUser.id}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Authentication</p>
              <p className="mt-1 text-lg">Authenticated through Clerk</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}