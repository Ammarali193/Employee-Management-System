"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../services/api";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type PayrollReportRow = {
  employee_name?: string;
  month?: string;
  year?: number;
  basic_salary?: number;
  allowance?: number;
  deduction?: number;
  net_salary?: number;
};

const unwrapRows = (payload: unknown): PayrollReportRow[] => {
  if (Array.isArray(payload)) return payload as PayrollReportRow[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as PayrollReportRow[];
  }
  return [];
};

const money = (value: number) => `Rs ${Number(value || 0).toLocaleString()}`;

export default function PayrollReportsPage() {
  const [rows, setRows] = useState<PayrollReportRow[]>([]);
  const [monthFilter, setMonthFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await api.get("/reports/payroll");
      setRows(unwrapRows(response.data));
    } catch (error) {
      console.error("[payroll reports] fetch failed", error);
      toast.error("Failed to load payroll reports");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (monthFilter === "all") return rows;
    return rows.filter((row) => String(row.month ?? "") === monthFilter);
  }, [rows, monthFilter]);

  const monthlySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    filteredRows.forEach((row) => {
      const key = `${row.month ?? "-"}-${row.year ?? "-"}`;
      summary[key] = (summary[key] ?? 0) + Number(row.net_salary ?? 0);
    });
    return Object.entries(summary).map(([label, total]) => ({ label, total }));
  }, [filteredRows]);

  const months = Array.from(new Set(rows.map((row) => String(row.month ?? "")).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void loadReports()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Load Payroll Reports"}
        </button>
        <select
          value={monthFilter}
          onChange={(event) => setMonthFilter(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <EnterpriseCard title="Total Payroll Entries" value={filteredRows.length} />
        <EnterpriseCard
          title="Total Net Salary"
          value={money(filteredRows.reduce((acc, row) => acc + Number(row.net_salary ?? 0), 0))}
        />
        <EnterpriseCard
          title="Avg Net Salary"
          value={
            filteredRows.length
              ? money(
                  filteredRows.reduce((acc, row) => acc + Number(row.net_salary ?? 0), 0) /
                    filteredRows.length,
                )
              : money(0)
          }
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Monthly Summary</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {monthlySummary.map((item) => (
            <article key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">{item.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{money(item.total)}</p>
            </article>
          ))}
          {monthlySummary.length === 0 ? (
            <p className="text-sm text-slate-500">No monthly summary data yet</p>
          ) : null}
        </div>
      </section>

      <EnterpriseTable
        rows={filteredRows}
        rowKey={(row, index) => `${row.employee_name ?? "employee"}-${index}`}
        emptyLabel="No payroll report entries found"
        columns={[
          { key: "employee", header: "Employee", render: (row) => row.employee_name ?? "-" },
          { key: "month", header: "Month", render: (row) => row.month ?? "-" },
          { key: "year", header: "Year", render: (row) => row.year ?? "-" },
          {
            key: "basic",
            header: "Basic",
            render: (row) => money(Number(row.basic_salary ?? 0)),
          },
          {
            key: "allowance",
            header: "Allowance",
            render: (row) => money(Number(row.allowance ?? 0)),
          },
          {
            key: "deduction",
            header: "Deduction",
            render: (row) => money(Number(row.deduction ?? 0)),
          },
          {
            key: "net",
            header: "Net Salary",
            render: (row) => <span className="font-semibold text-emerald-700">{money(Number(row.net_salary ?? 0))}</span>,
          },
        ]}
      />
    </div>
  );
}
