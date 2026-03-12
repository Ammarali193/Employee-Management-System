"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type AttendanceRecord = {
  id: number | string;
  check_in?: string | null;
  check_out?: string | null;
  status?: string | null;
};

export default function EmployeeAttendance() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!id) {
        return;
      }

      const res = await fetch(`http://localhost:5000/api/attendance/employee/${id}`);
      const data = await res.json();

      setRecords(Array.isArray(data) ? data : []);
    };

    void loadHistory();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Attendance</h1>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Date</th>
            <th className="p-2">Check In</th>
            <th className="p-2">Check Out</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {records.map((rec) => (
            <tr key={rec.id} className="border-t">
              <td className="p-2">
                {rec.check_in ? new Date(rec.check_in).toLocaleDateString() : "-"}
              </td>

              <td className="p-2">{rec.check_in}</td>
              <td className="p-2">{rec.check_out}</td>
              <td className="p-2">{rec.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
