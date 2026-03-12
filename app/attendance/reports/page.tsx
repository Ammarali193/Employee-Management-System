"use client";

import { useEffect, useState } from "react";

type AttendanceSummary = {
  employee_id: number | string;
  employee_name?: string | null;
  present?: number | string | null;
  absent?: number | string | null;
  hours?: number | string | null;
};

export default function AttendanceReports() {
  const [reports, setReports] = useState<AttendanceSummary[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      const res = await fetch("http://localhost:5000/api/attendance/reports");
      const data = await res.json();

      setReports(Array.isArray(data) ? data : []);
    };

    void loadReports();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Attendance Reports</h1>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Employee</th>
            <th className="p-2 text-center">Present Days</th>
            <th className="p-2 text-center">Absent Days</th>
            <th className="p-2 text-center">Total Hours</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((rep, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{rep.employee_name || "-"}</td>
              <td className="p-2 text-center">{rep.present || 0}</td>
              <td className="p-2 text-center">{rep.absent || 0}</td>
              <td className="p-2 text-center">
                {rep.hours ? Number(rep.hours).toFixed(2) : 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
