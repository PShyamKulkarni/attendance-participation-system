"use client";

import { FormEvent, useState } from "react";

export default function JoinOrganizationPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/organization/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to join organization");
        return;
      }

      setMessage(data.message);
      setCode("");
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-lg border border-gray-700 p-8">
        <h1 className="text-2xl font-bold">Join Organization</h1>

        <p className="mt-2 text-sm text-gray-400">
          Enter the organization code provided by your administrator.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="organization-code"
              className="mb-2 block text-sm text-gray-300"
            >
              Organization Code
            </label>

            <input
              id="organization-code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="ADM-XXXX-XXXX-XXXX"
              className="w-full border border-gray-600 bg-black px-4 py-3 text-white outline-none focus:border-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-white px-4 py-3 font-medium hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Organization"}
          </button>
        </form>

        {message && (
          <p className="mt-6 border border-gray-600 p-4 text-sm">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 border border-gray-600 p-4 text-sm text-gray-300">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}