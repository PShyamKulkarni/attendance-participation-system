"use client";

import { useState } from "react";

type Dispute = {
  id: string;
  reason: string;
  status: "OPEN" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
  student: {
    name: string | null;
    email: string;
  };
  session: {
    course: {
      name: string;
      code: string;
    };
  };
  attendanceRecord: {
    verifiedAt: string;
  } | null;
};

type DisputeTableProps = {
  disputes: Dispute[];
};

export default function DisputeTable({
  disputes: initialDisputes,
}: DisputeTableProps) {
  const [disputes, setDisputes] = useState(initialDisputes);
  const [loadingDisputeId, setLoadingDisputeId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  async function reviewDispute(
    disputeId: string,
    decision: "APPROVED" | "REJECTED",
  ) {
    setLoadingDisputeId(disputeId);
    setError("");

    try {
      const response = await fetch(
        "/api/instructor/disputes",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            disputeId,
            decision,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to review dispute",
        );
      }

      setDisputes((currentDisputes) =>
        currentDisputes.map((dispute) =>
          dispute.id === disputeId
            ? {
                ...dispute,
                status: decision,
                reviewedAt: new Date().toISOString(),
              }
            : dispute,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setLoadingDisputeId(null);
    }
  }

  return (
    <div className="mt-8 overflow-x-auto">
      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-black text-white">
            <th className="border border-gray-300 p-3 text-left">
              Student
            </th>

            <th className="border border-gray-300 p-3 text-left">
              Course
            </th>

            <th className="border border-gray-300 p-3 text-left">
              Reason
            </th>

            <th className="border border-gray-300 p-3 text-left">
              Status
            </th>

            <th className="border border-gray-300 p-3 text-left">
              Created
            </th>

            <th className="border border-gray-300 p-3 text-left">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {disputes.map((dispute) => (
            <tr key={dispute.id}>
              <td className="border border-gray-300 p-3">
                <div>
                  {dispute.student.name ??
                    "Name not provided"}
                </div>

                <div className="text-sm text-gray-600">
                  {dispute.student.email}
                </div>
              </td>

              <td className="border border-gray-300 p-3">
                {dispute.session.course.code}
                <br />
                {dispute.session.course.name}
              </td>

              <td className="border border-gray-300 p-3">
                {dispute.reason}
              </td>

              <td className="border border-gray-300 p-3">
                {dispute.status}
              </td>

              <td className="border border-gray-300 p-3">
                {new Date(
                  dispute.createdAt,
                ).toLocaleString()}
              </td>

              <td className="border border-gray-300 p-3">
                {dispute.status === "OPEN" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        reviewDispute(
                          dispute.id,
                          "APPROVED",
                        )
                      }
                      disabled={
                        loadingDisputeId === dispute.id
                      }
                      className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        reviewDispute(
                          dispute.id,
                          "REJECTED",
                        )
                      }
                      disabled={
                        loadingDisputeId === dispute.id
                      }
                      className="rounded border border-black px-3 py-2 text-black disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span>
                    Reviewed{" "}
                    {dispute.reviewedAt
                      ? new Date(
                          dispute.reviewedAt,
                        ).toLocaleString()
                      : ""}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {disputes.length === 0 && (
        <p className="mt-6 text-gray-600">
          No attendance disputes found.
        </p>
      )}
    </div>
  );
}