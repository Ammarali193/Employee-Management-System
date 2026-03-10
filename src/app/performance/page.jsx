"use client";

import { useEffect, useState } from "react";
import performanceService from "@/services/performanceService";

export default function Performance() {
  const [records, setRecords] = useState([]);

  const loadData = async () => {
    const data = await performanceService.getPerformance();

    setRecords(data.records || []);
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Performance Records</h1>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Employee</th>
            <th className="p-2">Score</th>
            <th className="p-2">Feedback</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">
                {r.first_name} {r.last_name}
              </td>
              <td className="p-2">{r.score}</td>
              <td className="p-2">{r.feedback}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
