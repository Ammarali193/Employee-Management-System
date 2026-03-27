"use client";

import { useEffect, useState } from "react";
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

export default function AdminLeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaveRequests = async () => {
      try {
        const data = await leaveService.getAllLeaves();
        setLeaveRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load leave requests:", error);
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
      <h1 className="text-2xl font-bold mb-6">Admin Leave Management</h1>

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
