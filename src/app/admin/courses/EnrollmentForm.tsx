"use client";

import { useState } from "react";

type Course = {
  id: string;
  name: string;
  code: string;
};

type Student = {
  id: string;
  name: string | null;
  email: string;
};

type EnrollmentFormProps = {
  courses: Course[];
  students: Student[];
};

export default function EnrollmentForm({
  courses,
  students,
}: EnrollmentFormProps) {
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function enrollStudent(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          studentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to enroll student",
        );
      }

      setMessage("Student enrolled successfully.");

      setCourseId("");
      setStudentId("");
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
      onSubmit={enrollStudent}
      className="mt-8 max-w-xl space-y-4 rounded border border-gray-300 p-6"
    >
      <h2 className="text-xl font-semibold">
        Enroll Student
      </h2>

      <div>
        <label className="mb-1 block font-medium">
          Course
        </label>

        <select
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
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

      <div>
        <label className="mb-1 block font-medium">
          Student
        </label>

        <select
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          className="w-full rounded border border-gray-300 p-2"
          required
        >
          <option value="">
            Select a student
          </option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name ?? student.email}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded border border-green-300 bg-green-50 p-3 text-green-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Enrolling..." : "Enroll Student"}
      </button>
    </form>
  );
}