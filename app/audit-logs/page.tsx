"use client";

import { useEffect, useMemo, useState } from "react";
import advancedService from "@/services/advancedService";

type AuditLog = {
  id: number;
  user_name?: string;
  user_id?: number;
  action?: string;
  module?: string;
  timestamp?: string;
};

const getActionBadgeColor = (action: string) => {
  const actionLower = (action || "").toLowerCase();
  
  // Create/Add/Created/Posted actions → Green
  if (actionLower.includes("create") || actionLower.includes("add") || actionLower.includes("upload") || actionLower.includes("posted") || actionLower.includes("submitted") || actionLower.includes("scheduled") || actionLower.includes("marked") || actionLower.includes("approve") || actionLower.includes("approve")) return "bg-green-100 text-green-700";
  
  // Update actions → Blue
  if (actionLower.includes("update")) return "bg-blue-100 text-blue-700";
  
  // Delete/Closed actions → Red
  if (actionLower.includes("delete") || actionLower.includes("closed") || actionLower.includes("cancelled")) return "bg-red-100 text-red-700";
  
  // Login/Logout/Auth actions → Gray
  if (actionLower.includes("login") || actionLower.includes("logout") || actionLower.includes("authenticated") || actionLower.includes("register")) return "bg-gray-100 text-gray-700";
  
  // Approve/Reject actions → Green/Red
  if (actionLower.includes("approve") || actionLower.includes("approved")) return "bg-green-100 text-green-700";
  if (actionLower.includes("reject") || actionLower.includes("rejected")) return "bg-red-100 text-red-700";
  
  // View/Viewed actions → Purple
  if (actionLower.includes("view")) return "bg-purple-100 text-purple-700";
  
  // Process actions → Yellow
  if (actionLower.includes("process") || actionLower.includes("assign")) return "bg-yellow-100 text-yellow-700";
  
  // Default
  return "bg-slate-100 text-slate-700";
};

const formatDateTime = (timestamp: string | undefined) => {
  if (!timestamp) return "N/A";
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "N/A";
    
    // Format as "28 Mar 2026, 10:30 AM"
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    
    return date.toLocaleDateString("en-US", options);
  } catch {
    return "N/A";
  }
};

export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await advancedService.getAuditLogs();
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading audit logs:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = (row.user_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesModule = !filterModule || row.module === filterModule;
      const matchesAction = !filterAction || row.action === filterAction;
      
      return matchesSearch && matchesModule && matchesAction;
    });
  }, [rows, searchTerm, filterModule, filterAction]);

  const uniqueModules = useMemo(
    () => [...new Set(rows.map((r) => r.module).filter(Boolean))].sort(),
    [rows]
  );

  const uniqueActions = useMemo(
    () => [...new Set(rows.map((r) => r.action).filter(Boolean))].sort(),
    [rows]
  );

  const inputClassName =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
          <p className="mt-2 text-base text-slate-600">Track and monitor all system activities and changes</p>
        </div>

        {/* Search and Filters */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Search User</label>
              <input
                type="text"
                placeholder="Search user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={inputClassName}
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Module</label>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className={inputClassName}
              >
                <option value="">All Modules</option>
                {uniqueModules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Action</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className={inputClassName}
              >
                <option value="">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="rounded-xl bg-white shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-600">Loading audit logs...</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
              {searchTerm || filterModule || filterAction
                ? "No logs match your filters"
                : "No audit logs found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">User Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Module</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Action</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="border-t border-slate-200 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {row.user_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.module || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getActionBadgeColor(
                            row.action
                          )}`}
                        >
                          {row.action || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDateTime(row.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Footer */}
          {filteredRows.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-600">
              <p>
                Showing <span className="font-semibold text-slate-900">{filteredRows.length}</span> of{" "}
                <span className="font-semibold text-slate-900">{rows.length}</span> total logs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
