"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

type PayrollRecord = {
  id: number;
  employee_id?: number;
  employee_name?: string;
  basic_salary?: number;
  allowance?: number;
  deduction?: number;
  net_salary?: number;
  month?: string;
};

const PAGE_SIZE = 10;

const extractPayroll = (payload: unknown): PayrollRecord[] => {
  if (Array.isArray(payload)) return payload as PayrollRecord[];

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.payroll)) return data.payroll as PayrollRecord[];
    if (Array.isArray(data.records)) return data.records as PayrollRecord[];
    if (Array.isArray(data.data)) return data.data as PayrollRecord[];
    if (Array.isArray(data.items)) return data.items as PayrollRecord[];
  }

  return [];
};

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: number; name?: string; email?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [deductions, setDeductions] = useState("0");

  const loadPayroll = async () => {
    setLoading(true);
    setError(null);

    try {
      const [payrollResponse, employeeResponse] = await Promise.all([
        api.get("/payroll"),
        api.get("/employees"),
      ]);

      setRecords(extractPayroll(payrollResponse.data));

      const employeePayload = employeeResponse.data;
      const employeeRows = Array.isArray(employeePayload?.data)
        ? employeePayload.data
        : Array.isArray(employeePayload)
          ? employeePayload
          : [];

      setEmployees(employeeRows);
    } catch (loadError) {
      console.error("[payroll] Failed to load", loadError);
      setError("Unable to load payroll records");
      toast.error("Payroll load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayroll();
  }, []);

  const generatePayroll = async () => {
    try {
      if (!employeeId || !basicSalary) {
        toast.error("Select employee and enter basic salary");
        return;
      }

      await api.post("/payroll/generate", {
        employee_id: Number(employeeId),
        basic_salary: Number(basicSalary),
        deductions: Number(deductions || 0),
      });

      toast.success("Payroll generated successfully");
      await loadPayroll();
    } catch (generateError) {
      console.error("[payroll] Generate failed", generateError);
      toast.error("Unable to generate payroll");
    }
  };

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return records.filter((record) => {
      return (
        String(record.employee_name ?? "").toLowerCase().includes(keyword) ||
        String(record.month ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const paginatedRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Payroll Management</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              title="Select Employee"
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name || employee.email || `Employee #${employee.id}`}
                </option>
              ))}
            </select>
            <input
              value={basicSalary}
              onChange={(event) => setBasicSalary(event.target.value)}
              placeholder="Basic Salary"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={deductions}
              onChange={(event) => setDeductions(event.target.value)}
              placeholder="Deductions"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void generatePayroll()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Generate Payroll
            </button>
            <button
              type="button"
              onClick={() => void loadPayroll()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Salary Table</h3>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee or month"
            className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-600">Loading payroll records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Employee</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Basic Salary</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Allowance</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Deduction</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Net Salary</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Month</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record, index) => (
                  <tr key={record.id ?? `payroll-${index}`} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-sm text-slate-700">
                      {record.employee_name ?? `Employee #${record.employee_id ?? "-"}`}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-700">{Number(record.basic_salary ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{Number(record.allowance ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{Number(record.deduction ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-slate-700">{Number(record.net_salary ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{record.month ?? "-"}</td>
                  </tr>
                ))}
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                      No payroll records found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
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
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
