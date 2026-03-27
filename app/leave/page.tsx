"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import leaveService from "@/services/leaveService";

type LeaveRequest = {
  id: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason?: string;
};

export default function LeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaveRequests = async () => {
      try {
        const data = await leaveService.getAllLeaves();
        setLeaveRequests(Array.isArray(data) ? data : []);
      } catch (error: any) {
        const message =
          error?.response?.data?.message || error?.message || "Failed to load leave requests.";
        console.error("Failed to load leave requests:", error);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadLeaveRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await leaveService.approveLeave(id);
      // Reload the list
      const data = await leaveService.getAllLeaves();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to approve leave:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await leaveService.rejectLeave(id);
      // Reload the list
      const data = await leaveService.getAllLeaves();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to reject leave:", error);
    }
  };

  if (loading) {
    return <div className="p-10">Loading leave requests...</div>;
  }

  return (
    <div className="p-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          {error && (
            <p className="mt-2 text-sm text-red-600">Unable to load leaves: {error}</p>
          )}
        </div>

        <div className="space-x-2">
          <Link
            href="/leave/apply"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Apply Leave
          </Link>
          <Link
            href="/leave/reports"
            className="rounded bg-green-500 px-4 py-2 text-white"
          >
            Leave Reports
          </Link>
        </div>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Leave Type</th>
            <th className="border p-2">Start Date</th>
            <th className="border p-2">End Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((request) => (
            <tr key={request.id}>
              <td className="border p-2">{request.employee_name}</td>
              <td className="border p-2">{request.leave_type}</td>
              <td className="border p-2">{request.start_date}</td>
              <td className="border p-2">{request.end_date}</td>
              <td className="border p-2">{request.status}</td>
              <td className="space-x-2 border p-2">
                {request.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="rounded bg-green-500 px-2 py-1 text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="rounded bg-red-500 px-2 py-1 text-white"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
