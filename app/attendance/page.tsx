"use client";

import { useEffect, useState } from "react";

type AttendanceRecord = {
  id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
};

export default function AttendancePage() {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  const fetchHistory = async (): Promise<AttendanceRecord[]> => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/attendance/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return Array.isArray(data) ? data : [];
  };

  useEffect(() => {
    void fetchHistory().then((data) => {
      setHistory(data);
    });
  }, []);

  const handleCheckIn = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/api/attendance/checkin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Checked in");
    setHistory(await fetchHistory());
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/api/attendance/checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Checked out");
    setHistory(await fetchHistory());
  };

  return (
    <div className="p-10">
      <h1 className="mb-6 text-2xl font-bold">Attendance</h1>

      <div className="mb-6 space-x-4">
        <button
          onClick={handleCheckIn}
          className="bg-green-500 px-4 py-2 text-white"
        >
          Clock In
        </button>

        <button
          onClick={handleCheckOut}
          className="bg-red-500 px-4 py-2 text-white"
        >
          Clock Out
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Check In</th>
            <th className="border p-2">Check Out</th>
          </tr>
        </thead>

        <tbody>
          {history.map((record) => (
            <tr key={record.id}>
              <td className="border p-2">{record.date}</td>
              <td className="border p-2">{record.check_in ?? "-"}</td>
              <td className="border p-2">{record.check_out ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
