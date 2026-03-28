"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type ReportRow = Record<string, unknown>;

type ReportsState = {
  attendance: ReportRow[];
  payroll: ReportRow[];
  leave: ReportRow[];
};

const toArray = (payload: unknown): ReportRow[] => {
  if (Array.isArray(payload)) return payload as ReportRow[];
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data as ReportRow[];
  }
  return [];
};

const tableColumnsFromRows = (rows: ReportRow[]) => {
  const firstRows = rows.slice(0, 8);
  const columnKeys = firstRows.length > 0 ? Object.keys(firstRows[0]).slice(0, 5) : [];

  return {
    rows: firstRows,
    columns: columnKeys.map((key) => ({
      key,
      header: key.replace(/_/g, " "),
      render: (row: ReportRow) => String(row[key] ?? "-"),
    })),
  };
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportsState>({
    attendance: [],
    payroll: [],
    leave: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const [attendancePayload, payrollPayload, leavePayload] = await Promise.all([
        adminService.getAttendanceReport(),
        adminService.getPayrollReport(),
        adminService.getLeaveReport(),
      ]);

      setReports({
        attendance: toArray(attendancePayload),
        payroll: toArray(payrollPayload),
        leave: toArray(leavePayload),
      });
    } catch (loadError) {
      console.error("[reports] Failed to load", loadError);
      setError("Unable to load reports");
      toast.error("Reports load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const renderReport = (title: string, rows: ReportRow[]) => {
    const mapped = tableColumnsFromRows(rows);

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">Total: {rows.length}</p>
        </div>
        <EnterpriseTable
          rows={mapped.rows}
          emptyLabel="No records found"
          rowKey={(_row, index) => `${title}-${index}`}
          columns={mapped.columns}
        />
      </section>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Reports</h2>
        <button
          type="button"
          onClick={() => void loadReports()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-600">Loading reports...</div>
      ) : (
        <>
          {renderReport("Attendance Report", reports.attendance)}
          {renderReport("Payroll Report", reports.payroll)}
          {renderReport("Leave Report", reports.leave)}
        </>
      )}
    </div>
  );
}
