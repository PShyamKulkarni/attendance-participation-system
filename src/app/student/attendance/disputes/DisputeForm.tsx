"use client";

import { useState } from "react";

type Attendance = {
  id: string;
  verifiedAt: string;
  courseName: string;
  courseCode: string;
};

type DisputeFormProps = {
  attendance: Attendance[];
};

export default function DisputeForm({
  attendance,
}: DisputeFormProps) {
  const [attendanceRecordId, setAttendanceRecordId] =
    useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitDispute(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/student/disputes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendanceRecordId,
            reason,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to create dispute",
        );
      }

      setMessage(
        "Attendance dispute created successfully.",
      );

      setAttendanceRecordId("");
      setReason("");
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
      onSubmit={submitDispute}
      className="mt-8 max-w-xl space-y-4 rounded border border-gray-300 bg-black p-6 text-white"
    >
      <h2 className="text-xl font-semibold">
        Raise Attendance Dispute
      </h2>

      <div>
        <label className="mb-1 block font-medium">
          Attendance Record
        </label>

        <select
          value={attendanceRecordId}
          onChange={(event) =>
            setAttendanceRecordId(event.target.value)
          }
          className="w-full rounded border border-gray-600 bg-white p-2 text-black"
          required
        >
          <option value="">
            Select attendance record
          </option>

          {attendance.map((record) => (
            <option
              key={record.id}
              value={record.id}
            >
              {record.courseCode} —{" "}
              {record.courseName} —{" "}
              {new Date(
                record.verifiedAt,
              ).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Reason
        </label>

        <textarea
          value={reason}
          onChange={(event) =>
            setReason(event.target.value)
          }
          placeholder="Explain why you are disputing this attendance record."
          rows={4}
          className="w-full rounded border border-gray-600 bg-white p-2 text-black"
          required
        />
      </div>

      {error && (
        <p className="rounded border border-red-400 bg-red-100 p-3 text-red-800">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded border border-green-400 bg-green-100 p-3 text-green-800">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-white px-5 py-2 font-medium text-black disabled:opacity-50"
      >
        {loading
          ? "Submitting..."
          : "Submit Dispute"}
      </button>
    </form>
  );
}