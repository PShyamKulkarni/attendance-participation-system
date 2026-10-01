"use client";

import { useState } from "react";

type Course = {
  id: string;
  name: string;
  code: string;
};

type SessionFormProps = {
  courses: Course[];
};

type SessionResult = {
  session: {
    id: string;
    courseId: string;
    startsAt: string;
    endsAt: string;
    codeExpiresAt: string;
    status: string;
  };
  verificationCode: string;
};

export default function SessionForm({
  courses,
}: SessionFormProps) {
  const [courseId, setCourseId] = useState("");
  const [result, setResult] = useState<SessionResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createSession(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "/api/instructor/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to create attendance session",
        );
      }

      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 max-w-xl">
      <form
        onSubmit={createSession}
        className="space-y-4 rounded border border-gray-300 p-6"
      >
        <h2 className="text-xl font-semibold">
          Start Attendance Session
        </h2>

        <div>
          <label className="mb-1 block font-medium">
            Course
          </label>

          <select
            value={courseId}
            onChange={(event) =>
              setCourseId(event.target.value)
            }
            className="w-full rounded border border-gray-300 p-2"
            required
          >
            <option value="">
              Select a course
            </option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Starting..." : "Start Session"}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded border border-green-300 bg-green-50 p-6">
          <h2 className="text-xl font-semibold">
            Attendance Session Active
          </h2>

          <p className="mt-4">
            Verification Code:
          </p>

          <p className="mt-2 text-4xl font-bold tracking-widest">
            {result.verificationCode}
          </p>

          <p className="mt-4 text-sm">
            The verification code expires at:
          </p>

          <p className="text-sm font-medium">
            {new Date(
              result.session.codeExpiresAt,
            ).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}