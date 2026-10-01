"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-700 bg-black text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Project Name */}
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-wide text-white"
        >
          ATTENDANCE SYSTEM
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">

          <Link
            href="/dashboard"
            className="font-medium text-white hover:underline"
          >
            Home
          </Link>

          <Link
            href="/calendar"
            className="font-medium text-white hover:underline"
          >
            Calendar
          </Link>

          <Link
            href="/profile"
            className="font-medium text-white hover:underline"
          >
            User Info
          </Link>

          {/* Clerk authentication */}
          <UserButton />
        </div>
      </div>
    </nav>
  );
}