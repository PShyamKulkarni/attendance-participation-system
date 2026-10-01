"use client";

import { useState } from "react";

type Props = {
  userId: string;
  status: string;
};

export default function UserActions({ userId, status }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function verifyUser() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users/verify", {
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
        setMessage(data.error ?? "Verification failed");
        return;
      }

      setMessage("Verified successfully");

      window.location.reload();
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (status === "VERIFIED") {
    return <span className="text-gray-400">Verified</span>;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={verifyUser}
        disabled={loading}
        className="border border-white px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-black disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {message && (
        <span className="text-sm text-gray-400">
          {message}
        </span>
      )}
    </div>
  );
}