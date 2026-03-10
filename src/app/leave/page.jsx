"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import leaveService from "@/services/leaveService";

export default function LeavePage() {
  const [leaves, setLeaves] = useState([]);

  const loadLeaves = async () => {
    try {
      const data = await leaveService.getMyLeaves();
      setLeaves(data.leave_requests || []);
    } catch (err) {
      console.error("Leave load error", err);
    }
  };

  useEffect(() => {
    void loadLeaves();
  }, []);

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">My Leaves</h1>

        <Link
          href="/leave/apply"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Apply Leave
        </Link>
      </div>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Type</th>
            <th className="p-2">Start</th>
            <th className="p-2">End</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {leaves.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No leave records found
              </td>
            </tr>
          ) : (
            leaves.map((leave) => {
              console.log("LEAVE:", leave);

              return (
                <tr key={leave.id} className="border-t">
                  <td className="p-2">
                    {leave.leave_type || leave.type || "-"}
                  </td>

                  <td className="p-2">
                    {new Date(leave.start_date).toLocaleDateString()}
                  </td>

                  <td className="p-2">
                    {new Date(leave.end_date).toLocaleDateString()}
                  </td>

                  <td className="p-2">{leave.status}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
