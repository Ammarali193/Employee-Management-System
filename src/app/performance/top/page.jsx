"use client";

import { useEffect, useState } from "react";
import performanceService from "@/services/performanceService";

export default function TopPerformers() {
  const [records, setRecords] = useState([]);

  const loadTop = async () => {
    const data = await performanceService.getTopPerformers();

    setRecords(data.top || []);
  };

  useEffect(() => {
    void loadTop();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Top Performers</h1>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Employee</th>
            <th className="p-2">Score</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.employee_id}</td>
              <td className="p-2">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
