"use client";

import { useEffect, useState } from "react";
import attendanceService from "@/services/attendanceService";

type AttendanceLog = {
  id: number | string;
  employee_name?: string | null;
  shift?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  hours?: number | string | null;
  overtime?: number | string | null;
  late?: boolean | number | null;
  status?: string | null;
};

type AttendanceStats = {
  total?: number;
  present?: number;
  absent?: number;
};

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({});

  const getEmployeeId = () => {
    const storedEmployeeId = localStorage.getItem("employee_id");
    const employeeId = Number(storedEmployeeId ?? 4);

    return Number.isFinite(employeeId) ? employeeId : 4;
  };

const loadAttendance = async () => {
  const data = await attendanceService.getAttendance();
  setRecords(Array.isArray(data) ? data : []);
};

  const loadStats = async () => {
    const res = await fetch("http://localhost:5000/api/attendance/stats");
    const data = await res.json();

    setStats(data ?? {});
  };

  const checkIn = async () => {
    await fetch("http://localhost:5000/api/attendance/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: getEmployeeId() }),
    });

    await loadStats();
    await loadAttendance();
  };

  const checkOut = async () => {
    await fetch("http://localhost:5000/api/attendance/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: getEmployeeId() }),
    });

    await loadStats();
    await loadAttendance();
  };

  useEffect(() => {
    const loadData = async () => {
      await loadStats();
      await loadAttendance();
    };
    void loadData();
  }, []);

  const formatTime = (time?: string | null) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShiftTime = (time?: string | null) => {
    if (!time) return "-";

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      return time.slice(0, 5);
    }

    const parsedTime = new Date(time);

    if (Number.isNaN(parsedTime.getTime())) {
      return time;
    }

    return parsedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Attendance Logs</h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={checkIn}
          className="rounded bg-green-600 px-4 py-2 font-medium text-white"
        >
          Check In
        </button>

        <button
          onClick={checkOut}
          className="rounded bg-red-600 px-4 py-2 font-medium text-white"
        >
          Check Out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-gray-500">Total Records</h3>
          <p className="text-2xl font-bold">{stats.total ?? 0}</p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-gray-500">Present</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.present ?? 0}
          </p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-gray-500">Absent</h3>
          <p className="text-2xl font-bold text-red-600">
            {stats.absent ?? 0}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Employee</th>
              <th className="p-2 text-left">Shift</th>
              <th className="p-2 text-center">Start</th>
              <th className="p-2 text-center">End</th>
              <th className="p-2 text-center">Date</th>
              <th className="p-2 text-center">Check In</th>
              <th className="p-2 text-center">Check Out</th>
              <th className="p-2 text-center">Hours</th>
              <th className="p-2 text-center">Overtime</th>
              <th className="p-2 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map((rec) => {
              const date = rec.check_in
                ? new Date(rec.check_in).toLocaleDateString()
                : "-";

              return (
                <tr key={rec.id} className="border-t">
                  <td className="p-2">{rec.employee_name}</td>

                  <td className="p-2">{rec.shift ?? "-"}</td>

                  <td className="p-2 text-center">
                    {formatShiftTime(rec.start_time)}
                  </td>

                  <td className="p-2 text-center">
                    {formatShiftTime(rec.end_time)}
                  </td>

                  <td className="p-2 text-center">{date}</td>

                  <td className="p-2 text-center">{formatTime(rec.check_in)}</td>

                  <td className="p-2 text-center">{formatTime(rec.check_out)}</td>

                  <td className="p-2 text-center">
                    {rec.hours ? Number(rec.hours).toFixed(2) : 0}
                  </td>

                  <td className="p-2 text-center">
                    {rec.overtime ? Number(rec.overtime).toFixed(2) : 0}
                  </td>

                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        rec.late
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {rec.late ? "Late" : "On Time"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
