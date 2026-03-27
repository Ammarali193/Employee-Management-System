"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import performanceService from "@/services/performanceService";

type PerformanceRecord = {
  id: number;
  employee_name: string;
  review_period: string;
  rating: number;
  comments?: string;
};

export default function PerformancePage() {
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        const data = await performanceService.getPerformance();
        setPerformanceRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load performance records:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  if (loading) {
    return <div className="p-10">Loading performance records...</div>;
  }

  return (
    <div className="p-10">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Performance Management</h1>
        <div className="space-x-2">
          <Link
            href="/performance/add"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Add Performance
          </Link>
          <Link
            href="/performance/top"
            className="rounded bg-green-500 px-4 py-2 text-white"
          >
            Top Performers
          </Link>
        </div>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Review Period</th>
            <th className="border p-2">Rating</th>
            <th className="border p-2">Comments</th>
          </tr>
        </thead>
        <tbody>
          {performanceRecords.map((record) => (
            <tr key={record.id}>
              <td className="border p-2">{record.employee_name}</td>
              <td className="border p-2">{record.review_period}</td>
              <td className="border p-2">{record.rating}</td>
              <td className="border p-2">{record.comments || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
