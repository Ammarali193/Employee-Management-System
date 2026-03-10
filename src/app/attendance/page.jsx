"use client";

import { useEffect, useState } from "react";
import attendanceService from "@/services/attendanceService";

export default function Attendance() {
  const [records, setRecords] = useState([]);

  const loadAttendance = async () => {
    const data = await attendanceService.getMyAttendance();
    setRecords(data.attendance);
  };

  useEffect(() => {
    const run = async () => {
      const data = await attendanceService.getMyAttendance();
      setRecords(data.attendance);
    };

    void run();
  }, []);

  const handleCheckIn = async () => {
    await attendanceService.checkIn();
    await loadAttendance();
  };

  const handleCheckOut = async () => {
    await attendanceService.checkOut();
    await loadAttendance();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Attendance</h1>

      <div className="mb-6 space-x-4">
        <button
          onClick={handleCheckIn}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Clock In
        </button>

        <button
          onClick={handleCheckOut}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Clock Out
        </button>
      </div>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Date</th>
            <th className="p-2">Check In</th>
            <th className="p-2">Check Out</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.check_in}</td>
              <td className="p-2">{r.check_out}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
