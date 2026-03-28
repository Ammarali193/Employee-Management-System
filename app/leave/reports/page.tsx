"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../services/api";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type LeaveReportRow = {
  employee_name?: string;
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
};

const unwrapRows = (payload: unknown): LeaveReportRow[] => {
  if (Array.isArray(payload)) return payload as LeaveReportRow[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as LeaveReportRow[];
  }
  return [];
};

const toCsv = (rows: LeaveReportRow[]) => {
  const header = ["employee_name", "leave_type", "from_date", "to_date", "status"];
  const body = rows.map((row) =>
    [
      row.employee_name ?? "",
      row.leave_type ?? "",
      row.from_date ?? "",
      row.to_date ?? "",
      row.status ?? "",
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...body].join("\n");
};

export default function LeaveReportsPage() {
  const [rows, setRows] = useState<LeaveReportRow[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await api.get("/reports/leave");
      setRows(unwrapRows(response.data));
    } catch (error) {
      console.error("[leave reports] fetch failed", error);
      toast.error("Failed to load leave reports");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const employeeMatch = String(row.employee_name ?? "")
        .toLowerCase()
        .includes(employeeFilter.toLowerCase().trim());
      const statusMatch =
        statusFilter === "all" || String(row.status ?? "").toLowerCase() === statusFilter;
      const typeMatch =
        typeFilter === "all" || String(row.leave_type ?? "").toLowerCase() === typeFilter;
      return employeeMatch && statusMatch && typeMatch;
    });
  }, [rows, employeeFilter, statusFilter, typeFilter]);

  const exportCsv = () => {
    const csv = toCsv(filteredRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leave-reports.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const leaveTypes = Array.from(
    new Set(rows.map((row) => String(row.leave_type ?? "").toLowerCase()).filter(Boolean)),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <EnterpriseCard title="Total Requests" value={rows.length} />
        <EnterpriseCard
          title="Approved"
          value={rows.filter((row) => String(row.status).toLowerCase() === "approved").length}
        />
        <EnterpriseCard
          title="Pending"
          value={rows.filter((row) => String(row.status).toLowerCase() === "pending").length}
        />
        <EnterpriseCard
          title="Rejected"
          value={rows.filter((row) => String(row.status).toLowerCase() === "rejected").length}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={employeeFilter}
            onChange={(event) => setEmployeeFilter(event.target.value)}
            placeholder="Filter by employee"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All Leave Types</option>
            {leaveTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadReports()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {loading ? "Loading..." : "Load Reports"}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Export CSV
            </button>
          </div>
        </div>
      </section>

      <EnterpriseTable
        rows={filteredRows}
        emptyLabel="No leave report records found"
        rowKey={(row, index) => `${row.employee_name ?? "employee"}-${index}`}
        columns={[
          {
            key: "employee",
            header: "Employee",
            render: (row) => row.employee_name ?? "-",
          },
          {
            key: "type",
            header: "Leave Type",
            render: (row) => row.leave_type ?? "-",
          },
          {
            key: "from",
            header: "From",
            render: (row) => row.from_date ?? "-",
          },
          {
            key: "to",
            header: "To",
            render: (row) => row.to_date ?? "-",
          },
          {
            key: "status",
            header: "Status",
            render: (row) => row.status ?? "-",
          },
        ]}
      />
    </div>
  );
}
