"use client";

import { useEffect, useMemo, useState } from "react";
import { getAttendanceReports } from "./api";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave" | string;

type AttendanceReportItem = {
  id?: number | string;
  attendance_id?: number | string;
  employee_id?: number | string;
  employeeName?: string;
  employee_name?: string;
  name?: string;
  date?: string;
  attendance_date?: string;
  checkIn?: string;
  checkOut?: string;
  check_in?: string;
  check_out?: string;
  totalHours?: number | string;
  total_hours?: number | string;
  status?: AttendanceStatus;
};

const ITEMS_PER_PAGE = 10;

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

const normalizeStatus = (status?: string) => {
  if (!status) return "Present";

  const normalized = status.trim().toLowerCase();
  if (normalized === "late") return "Late";
  if (normalized === "absent") return "Absent";
  if (normalized === "present") return "Present";
  if (normalized === "leave") return "Leave";

  return toTitleCase(normalized);
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "--";
  return parsed.toLocaleDateString();
};

const formatTime = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "--";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getEmployeeName = (item: AttendanceReportItem) =>
  (item.employeeName ?? item.employee_name ?? item.name ?? "").trim() || "--";

const getReportDate = (item: AttendanceReportItem) => item.date ?? item.attendance_date ?? "--";

const getCheckIn = (item: AttendanceReportItem) => item.checkIn ?? item.check_in ?? "--";

const getCheckOut = (item: AttendanceReportItem) => item.checkOut ?? item.check_out ?? "--";

const getTotalHours = (item: AttendanceReportItem) => Number(item.totalHours ?? item.total_hours ?? 0);

const toCsvValue = (value: string | number) => {
  const raw = String(value ?? "");
  return `"${raw.replaceAll('"', '""')}"`;
};

export default function AttendanceReportsPage() {
  const [reports, setReports] = useState<AttendanceReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAttendanceReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error("[attendance-reports] Failed to fetch data", fetchError);
      setError("Unable to load attendance reports right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const employees = useMemo(() => {
    const unique = new Set<string>();

    reports.forEach((item) => {
      const name = getEmployeeName(item);
      if (name) unique.add(name);
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [reports]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reports.filter((item) => {
      const employeeName = getEmployeeName(item);
      const status = normalizeStatus(item.status);
      const rawDate = getReportDate(item);

      const reportDate = rawDate ? new Date(rawDate) : null;
      const hasValidDate = reportDate && !Number.isNaN(reportDate.getTime());

      if (selectedEmployee !== "all" && employeeName !== selectedEmployee) {
        return false;
      }

      if (selectedStatus !== "all" && status !== selectedStatus) {
        return false;
      }

      if (normalizedSearch && !employeeName.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      if (fromDate && hasValidDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (reportDate < from) return false;
      }

      if (toDate && hasValidDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (reportDate > to) return false;
      }

      return true;
    });
  }, [reports, fromDate, toDate, selectedEmployee, selectedStatus, searchTerm]);

  const summary = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalWorkingHours = 0;

    filteredReports.forEach((item) => {
      const normalizedStatus = normalizeStatus(item.status);
      const hours = getTotalHours(item);

      if (normalizedStatus === "Present") totalPresent += 1;
      if (normalizedStatus === "Absent") totalAbsent += 1;
      if (normalizedStatus === "Late") totalLate += 1;
      if (!Number.isNaN(hours)) totalWorkingHours += hours;
    });

    return {
      totalPresent,
      totalAbsent,
      totalLate,
      totalWorkingHours,
    };
  }, [filteredReports]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, selectedEmployee, selectedStatus, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReports.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const downloadCsv = () => {
    const headers = [
      "Employee Name",
      "Date",
      "Check-in",
      "Check-out",
      "Total Hours",
      "Status",
    ];

    const rows = filteredReports.map((item) => {
      const employeeName = getEmployeeName(item);
      const reportDate = formatDate(getReportDate(item));
      const checkIn = formatTime(getCheckIn(item));
      const checkOut = formatTime(getCheckOut(item));
      const totalHours = getTotalHours(item).toFixed(2);
      const status = normalizeStatus(item.status);

      return [employeeName, reportDate, checkIn, checkOut, totalHours, status]
        .map((value) => toCsvValue(value))
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRowClassName = (status: string) => {
    if (status === "Late") {
      return "bg-red-50 hover:bg-red-100";
    }

    if (status === "Absent") {
      return "bg-gray-100 hover:bg-gray-200";
    }

    return "hover:bg-slate-50";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Attendance Reports</h1>
              <p className="mt-1 text-sm text-slate-600">
                Track attendance trends, punctuality, and employee working hours.
              </p>
            </div>
            <button
              onClick={downloadCsv}
              disabled={loading || filteredReports.length === 0}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export to CSV
            </button>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="fromDate" className="mb-1 block text-sm font-medium text-slate-700">
                From
              </label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="toDate" className="mb-1 block text-sm font-medium text-slate-700">
                To
              </label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="employeeFilter" className="mb-1 block text-sm font-medium text-slate-700">
                Employee
              </label>
              <select
                id="employeeFilter"
                value={selectedEmployee}
                onChange={(event) => setSelectedEmployee(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              >
                <option value="all">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statusFilter" className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="statusFilter"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              >
                <option value="all">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            <div>
              <label htmlFor="searchEmployee" className="mb-1 block text-sm font-medium text-slate-700">
                Search Employee
              </label>
              <input
                id="searchEmployee"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Type employee name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Present</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.totalPresent}</p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Absent</p>
            <p className="mt-2 text-3xl font-bold text-slate-600">{summary.totalAbsent}</p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Late</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{summary.totalLate}</p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Working Hours</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {summary.totalWorkingHours.toFixed(2)}
            </p>
          </article>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Attendance Table</h2>
            <button
              onClick={() => void fetchReports()}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh Data
            </button>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => void fetchReports()}
                className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employee Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Check-in</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Check-out</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total Hours</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                          No attendance records found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedReports.map((item, index) => {
                        const status = normalizeStatus(item.status);
                        const employeeName = getEmployeeName(item);
                        const reportDate = getReportDate(item);
                        const rowKey =
                          item.id ??
                          item.attendance_id ??
                          `${item.employee_id ?? employeeName}-${reportDate ?? "no-date"}-${index}`;

                        return (
                          <tr key={rowKey} className={`border-t border-slate-200 transition ${getRowClassName(status)}`}>
                            <td className="px-4 py-3 text-sm text-slate-800">{employeeName}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{formatDate(reportDate)}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{formatTime(getCheckIn(item))}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{formatTime(getCheckOut(item))}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {getTotalHours(item).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-800">{status}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of {filteredReports.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
