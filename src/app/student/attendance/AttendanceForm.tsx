"use client";

import { useState } from "react";

type AttendanceSession = {
  id: string;
  courseName: string;
  courseCode: string;
  startsAt: string;
  endsAt: string;
  codeExpiresAt: string;
};

type AttendanceFormProps = {
  session: AttendanceSession;
};

export default function AttendanceForm({
  session,
}: AttendanceFormProps) {
  const [verificationCode, setVerificationCode] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function verifyAttendance(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/student/attendance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: session.id,
            verificationCode,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to verify attendance",
        );
      }

      setMessage(
        "Attendance verified successfully.",
      );

      setVerificationCode("");
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
    <form
      onSubmit={verifyAttendance}
      className="max-w-xl rounded border border-gray-300 bg-black p-6 text-white"
    >
      <h2 className="text-xl font-semibold">
        {session.courseCode} — {session.courseName}
      </h2>

      <p className="mt-3 text-sm text-gray-300">
        Enter the 6-digit verification code provided
        by your instructor.
      </p>

      <div className="mt-5">
        <label className="mb-1 block font-medium">
          Verification Code
        </label>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          value={verificationCode}
          onChange={(event) =>
            setVerificationCode(event.target.value)
          }
          placeholder="Enter 6-digit code"
          className="w-full rounded border border-gray-600 bg-white p-3 text-black"
          required
        />
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-400 bg-red-100 p-3 text-red-800">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-4 rounded border border-green-400 bg-green-100 p-3 text-green-800">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 rounded bg-white px-5 py-2 font-medium text-black disabled:opacity-50"
      >
        {loading
          ? "Verifying..."
          : "Verify Attendance"}
      </button>

      <p className="mt-4 text-xs text-gray-400">
        Code expires at{" "}
        {new Date(
          session.codeExpiresAt,
        ).toLocaleString()}
      </p>
    </form>
  );
}