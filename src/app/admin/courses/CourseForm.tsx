"use client";

import { useState } from "react";

type Instructor = {
  id: string;
  name: string | null;
  email: string;
};

type CourseFormProps = {
  instructors: Instructor[];
};

export default function CourseForm({
  instructors,
}: CourseFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [instructorId, setInstructorId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function createCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          code,
          instructorId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create course");
      }

      setMessage("Course created successfully.");

      setName("");
      setCode("");
      setInstructorId("");

      window.location.reload();
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
      onSubmit={createCourse}
      className="mt-8 max-w-xl space-y-4 rounded border border-gray-300 p-6"
    >
      <h2 className="text-xl font-semibold">
        Create Course
      </h2>

      <div>
        <label className="mb-1 block font-medium">
          Course Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Data Structures"
          className="w-full rounded border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Course Code
        </label>

        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Example: CS301"
          className="w-full rounded border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Instructor
        </label>

        <select
          value={instructorId}
          onChange={(event) => setInstructorId(event.target.value)}
          className="w-full rounded border border-gray-300 p-2"
          required
        >
          <option value="">
            Select an instructor
          </option>

          {instructors.map((instructor) => (
            <option
              key={instructor.id}
              value={instructor.id}
            >
              {instructor.name ?? instructor.email}
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
        {loading ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
}