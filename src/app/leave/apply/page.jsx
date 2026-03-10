"use client";

import { useState } from "react";
import leaveService from "@/services/leaveService";

export default function ApplyLeave() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await leaveService.applyLeave({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
    });

    alert("Leave applied");
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Apply Leave</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="mb-4 w-full border p-2"
        >
          <option value="">Select Leave Type</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Casual Leave">Casual Leave</option>
          <option value="Annual Leave">Annual Leave</option>
        </select>

        <input
          type="date"
          value={startDate}
          className="w-full border p-2"
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          className="w-full border p-2"
          onChange={(e) => setEndDate(e.target.value)}
        />

        <textarea
          value={reason}
          placeholder="Reason"
          className="w-full border p-2"
          onChange={(e) => setReason(e.target.value)}
        />

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Apply
        </button>
      </form>
    </div>
  );
}
