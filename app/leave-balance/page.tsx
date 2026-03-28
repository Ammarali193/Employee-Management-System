"use client";

import { useEffect, useMemo, useState } from "react";
import advancedService from "@/services/advancedService";

export default function LeaveBalancePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await advancedService.getLeaveBalance();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading leave balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += Number(row.total_leaves || 0);
        acc.used += Number(row.used_leaves || 0);
        acc.remaining += Number(row.remaining_leaves || 0);
        return acc;
      },
      { total: 0, used: 0, remaining: 0 },
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((row) =>
      (row.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const getProgressPercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-slate-900">Leave Balance</h1>
          <p className="mt-2 text-base text-slate-600">Track and manage employee leave allocation and usage</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Total Leaves Card */}
          <div className="rounded-xl bg-blue-50 p-6 shadow-md border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Leaves</p>
                <p className="mt-2 text-4xl font-bold text-blue-900">{summary.total}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          {/* Used Leaves Card */}
          <div className="rounded-xl bg-red-50 p-6 shadow-md border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Used Leaves</p>
                <p className="mt-2 text-4xl font-bold text-red-900">{summary.used}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          {/* Remaining Leaves Card */}
          <div className="rounded-xl bg-green-50 p-6 shadow-md border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Remaining Leaves</p>
                <p className="mt-2 text-4xl font-bold text-green-900">{summary.remaining}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <input
            type="text"
            placeholder="Search employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Leave Balance Table */}
        <div className="rounded-xl bg-white shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-slate-600">Loading leave balance data...</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              {searchTerm ? "No employees found matching your search." : "No leave balance data available."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Employee Name</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Total</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Used</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Remaining</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => {
                    const total = Number(row.total_leaves || 0);
                    const used = Number(row.used_leaves || 0);
                    const remaining = Number(row.remaining_leaves || 0);
                    const progressPercent = getProgressPercentage(used, total);

                    return (
                      <tr
                        key={row.id || index}
                        className="border-t border-slate-200 transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {row.employee_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-700">
                          <span className="inline-flex rounded-lg bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                            {total}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <span className="inline-flex rounded-lg bg-red-100 px-3 py-1 font-semibold text-red-700">
                            {used}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <span className="inline-flex rounded-lg bg-green-100 px-3 py-1 font-semibold text-green-700">
                            {remaining}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="w-full space-y-1">
                            <div className="flex rounded-full bg-slate-200 overflow-hidden h-2">
                              <div
                                className="bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-600">{progressPercent}% used</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats Footer */}
        <div className="rounded-xl bg-white p-6 shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-slate-600">
            Total Employees: <span className="font-bold text-slate-900">{filteredRows.length}</span> | 
            Total Allocation: <span className="font-bold text-slate-900">{summary.total} days</span> | 
            Total Used: <span className="font-bold text-slate-900">{summary.used} days</span> | 
            Total Remaining: <span className="font-bold text-slate-900">{summary.remaining} days</span>
          </p>
        </div>
      </div>
    </div>
  );
}
