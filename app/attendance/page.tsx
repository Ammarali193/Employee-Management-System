"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

type Employee = {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
};

type AttendanceLog = {
  id: number | string;
  employee_id?: number;
  employee_name?: string;
  date?: string;
  check_in?: string;
  check_out?: string;
  total_hours?: number | string;
  overtime_hours?: number | string;
  overtimeHours?: number | string;
  status?: string;
};

type AttendanceStats = {
  total?: number;
  present?: number;
  absent?: number;
};

const PAGE_SIZE = 10;

const extractArray = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data as Record<string, unknown>[];
    if (Array.isArray(data.items)) return data.items as Record<string, unknown>[];
    if (Array.isArray(data.records)) return data.records as Record<string, unknown>[];
  }

  return [];
};

const getStatusBadgeClass = (status?: string) => {
  const normalized = String(status ?? "").trim().toLowerCase();

  if (normalized === "present") {
    return "bg-green-100 text-green-700";
  }

  if (normalized === "absent") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-600";
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({});
  const [role, setRole] = useState("employee");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<"checkin" | "checkout" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const storedRole = String(localStorage.getItem("role") || "employee").toLowerCase();
    setRole(storedRole);
  }, []);

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      if (role === "employee") {
        const [attendanceRes, statsRes] = await Promise.all([
          api.get("/attendance"),
          api.get("/attendance/stats"),
        ]);

        setEmployees([]);
        setRecords(extractArray(attendanceRes.data) as AttendanceLog[]);
        setStats((statsRes.data as AttendanceStats) ?? {});
      } else {
        const [employeesRes, attendanceRes, statsRes] = await Promise.all([
          api.get("/employees"),
          api.get("/attendance"),
          api.get("/attendance/stats"),
        ]);

        setEmployees(extractArray(employeesRes.data) as Employee[]);
        setRecords(extractArray(attendanceRes.data) as AttendanceLog[]);
        setStats((statsRes.data as AttendanceStats) ?? {});
      }
    } catch (loadError) {
      console.error("[attendance] Failed to load", loadError);
      setError("Unable to load attendance data.");
      toast.error("Attendance load failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const markAttendance = async (type: "checkin" | "checkout") => {
    if (!selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }

    setActionLoading(type);

    try {
      await api.post(`/attendance/${type}`, {
        employee_id: Number(selectedEmployeeId),
      });

      toast.success(type === "checkin" ? "Check-in marked" : "Check-out marked");
      await loadData(true);
    } catch (actionError) {
      console.error(`[attendance] ${type} failed`, actionError);
      toast.error(type === "checkin" ? "Unable to check in" : "Unable to check out");
    } finally {
      setActionLoading(null);
    }
  };

  const paginatedRecords = useMemo(
    () => records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [records, page],
  );
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6 bg-gray-100 p-6">
      <header className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track employee check-ins and check-outs with a clear attendance overview.
        </p>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedEmployeeId}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
            title="Select employee"
            aria-label="Select employee"
            className="min-w-[260px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => {
              const label =
                `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim() ||
                employee.name ||
                `Employee #${employee.id}`;
              return (
                <option key={employee.id} value={employee.id}>
                  {label}
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={() => void markAttendance("checkin")}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14" />
              <path d="m5 12 7-7 7 7" />
            </svg>
            {actionLoading === "checkin" ? "Checking in..." : "Check-in"}
          </button>

          <button
            type="button"
            onClick={() => void markAttendance("checkout")}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5" />
              <path d="m19 12-7 7-7-7" />
            </svg>
            {actionLoading === "checkout" ? "Checking out..." : "Check-out"}
          </button>

          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-3.5-7.1" />
              <path d="M21 3v6h-6" />
            </svg>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow">
          <p className="text-sm text-blue-700">Total Records</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{stats.total ?? 0}</p>
        </article>

        <article className="rounded-xl border border-green-200 bg-green-50 p-6 shadow">
          <p className="text-sm text-green-700">Present</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{stats.present ?? 0}</p>
        </article>

        <article className="rounded-xl border border-red-200 bg-red-50 p-6 shadow">
          <p className="text-sm text-red-700">Absent</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{stats.absent ?? 0}</p>
        </article>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Attendance Records</h2>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : paginatedRecords.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <p className="text-sm font-medium text-gray-600">No attendance records found</p>
            <p className="mt-1 text-xs text-gray-500">Try marking attendance or refreshing the list.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Check-in</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Check-out</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hours</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Overtime</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record, index) => (
                  <tr
                    key={record.id ?? `${record.employee_id ?? "emp"}-${index}`}
                    className="border-t border-gray-200 transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{record.employee_name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{formatTime(record.check_in)}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{formatTime(record.check_out)}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      {Number(record.total_hours ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      {Number(record.overtime_hours ?? record.overtimeHours ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          record.status,
                        )}`}
                      >
                        {record.status ?? "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, records.length)} of {records.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1.5 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
