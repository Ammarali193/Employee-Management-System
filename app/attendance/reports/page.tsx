"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

type AttendanceSummary = {
  id?: number | string;
  name?: string | null;
  present_days?: number | string | null;
  absent_days?: number | string | null;
  total_hours?: number | string | null;
};

export default function AttendanceReports() {
  const [reports, setReports] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/attendance/reports");
      console.log("API DATA:", res.data);
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch attendance reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
        <p className="text-muted-foreground mt-2">Review employee attendance patterns, present/absent days, and total worked hours.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : null}

      <div className="flex gap-2 mb-4">
        <button
          onClick={fetchReports}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <th className="p-4 text-left font-semibold text-gray-900">Employee</th>
              <th className="p-4 text-center font-semibold text-gray-900">Present Days</th>
              <th className="p-4 text-center font-semibold text-gray-900">Absent Days</th>
              <th className="p-4 text-center font-semibold text-gray-900">Total Hours</th>
            </tr>
          </thead>
          <tbody>
{reports.map((rep) => (
    <tr key={rep.id} className="border-t hover:bg-gray-50">
      
      <td className="p-4">
        {rep.name || "-"}
      </td>

      <td className="p-4 text-center">
        {Number(rep.present_days) || 0}
      </td>

      <td className="p-4 text-center">
        {Number(rep.absent_days) || 0}
      </td>

      <td className="p-4 text-center">
        {Number(rep.total_hours).toFixed(2)}h
      </td>

    </tr>
  ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
