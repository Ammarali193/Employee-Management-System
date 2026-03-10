"use client";

import { useEffect, useState } from "react";
import leaveService from "@/services/leaveService";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString();
};

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState([]);

  const loadLeaves = async () => {
    try {
      const data = await leaveService.getMyLeaves();
      const allLeaves = Array.isArray(data) ? data : [];
      const pendingLeaves = allLeaves.filter(
        (leave) => leave.status === "Pending"
      );

      setLeaves(pendingLeaves);
    } catch (err) {
      console.error("Pending leave load error", err);
    }
  };

  useEffect(() => {
    void loadLeaves();
  }, []);

  const handleApprove = async (id) => {
    await leaveService.approveLeave(id);
    await loadLeaves();
  };

  const handleReject = async (id) => {
    await leaveService.rejectLeave(id);
    await loadLeaves();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Leave Approval</h1>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Employee</th>
            <th className="p-2">Start</th>
            <th className="p-2">End</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {leaves.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center">
                No pending leave requests
              </td>
            </tr>
          )}

          {leaves.map((leave) => (
            <tr key={leave.id} className="border-t">
              <td className="p-2">{leave.employee_id ?? "-"}</td>
              <td className="p-2">{formatDate(leave.start_date)}</td>
              <td className="p-2">{formatDate(leave.end_date)}</td>

              <td className="flex gap-2 p-2">
                <button
                  type="button"
                  onClick={() => void handleApprove(leave.id)}
                  className="rounded bg-green-600 px-2 py-1 text-white"
                >
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() => void handleReject(leave.id)}
                  className="rounded bg-red-600 px-2 py-1 text-white"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
