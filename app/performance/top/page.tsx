"use client";

import { useEffect, useState } from "react";
import performanceService from "@/services/performanceService";

type TopPerformer = {
  id: number;
  employee_name: string;
  rating: number;
  department: string;
};

export default function TopPerformersPage() {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopPerformers = async () => {
      try {
        const data = await performanceService.getTopPerformers();
        setTopPerformers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load top performers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTopPerformers();
  }, []);

  if (loading) {
    return <div className="p-10">Loading top performers...</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Top Performers</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Rating</th>
          </tr>
        </thead>
        <tbody>
          {topPerformers.map((performer) => (
            <tr key={performer.id}>
              <td className="border p-2">{performer.employee_name}</td>
              <td className="border p-2">{performer.department}</td>
              <td className="border p-2">{performer.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
