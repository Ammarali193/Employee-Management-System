"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseFormSection } from "@/components/ui/enterprise-form-section";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type KpiRecord = {
  id?: number;
  employee_id: string;
  employee_name?: string;
  goal: string;
  progress: number;
  status: string;
};

const unwrapRows = (payload: unknown): KpiRecord[] => {
  if (Array.isArray(payload)) return payload as KpiRecord[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as KpiRecord[];
  }
  return [];
};

const defaultForm: KpiRecord = {
  employee_id: "",
  goal: "",
  progress: 0,
  status: "Pending",
};

export default function PerformanceKpiPage() {
  const [rows, setRows] = useState<KpiRecord[]>([]);
  const [form, setForm] = useState<KpiRecord>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadKpis = async () => {
    setLoading(true);
    try {
      const payload = await adminService.getKpis();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[kpi] load failed", error);
      toast.error("Failed to load KPI records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKpis();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.employee_id || !form.goal) {
      toast.error("Employee ID and goal are required");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createKpi(form);
      toast.success("KPI added successfully");
      setForm(defaultForm);
      await loadKpis();
    } catch (error) {
      console.error("[kpi] create failed", error);
      toast.error("Failed to create KPI");
    } finally {
      setSubmitting(false);
    }
  };

  const completion = useMemo(() => {
    if (!rows.length) return 0;
    const sum = rows.reduce((acc, row) => acc + Number(row.progress || 0), 0);
    return Math.round(sum / rows.length);
  }, [rows]);

  return (
    <div className="space-y-6 p-4">
      <EnterpriseFormSection
        title="KPI Tracker"
        description="Track goals and progress using /api/kpi"
        onSubmit={submit}
        actions={
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save KPI"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            title="Employee ID"
            value={form.employee_id}
            onChange={(event) => setForm((prev) => ({ ...prev, employee_id: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Employee ID"
          />
          <input
            title="Goal"
            value={form.goal}
            onChange={(event) => setForm((prev) => ({ ...prev, goal: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Goal"
          />
          <input
            title="Progress"
            type="number"
            min={0}
            max={100}
            value={form.progress}
            onChange={(event) => setForm((prev) => ({ ...prev, progress: Number(event.target.value || 0) }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Progress %"
          />
          <select
            title="Status"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
      </EnterpriseFormSection>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">KPI Dashboard</h3>
          <button
            type="button"
            onClick={() => void loadKpis()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm text-slate-600">
            <span>Overall Progress</span>
            <span>{completion}%</span>
          </div>
          <progress className="h-3 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-blue-600" value={completion} max={100} />
        </div>
      </section>

      <EnterpriseTable
        rows={rows}
        emptyLabel="No KPI records found"
        rowKey={(row, index) => row.id ?? `${row.employee_id}-${index}`}
        columns={[
          { key: "employee", header: "Employee", render: (row) => row.employee_name || row.employee_id },
          { key: "goal", header: "Goal", render: (row) => row.goal },
          {
            key: "progress",
            header: "Progress",
            render: (row) => (
              <div className="w-40">
                <div className="mb-1 text-xs text-slate-600">{row.progress}%</div>
                <progress className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-emerald-600" value={Number(row.progress || 0)} max={100} />
              </div>
            ),
          },
          { key: "status", header: "Status", render: (row) => row.status },
        ]}
      />
    </div>
  );
}
