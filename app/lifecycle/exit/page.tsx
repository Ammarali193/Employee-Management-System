"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseFormSection } from "@/components/ui/enterprise-form-section";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type ExitRecord = {
  id?: number;
  employee_id: string;
  first_name?: string;
  last_name?: string;
  reason: string;
  remarks?: string;
  exit_date?: string;
  status?: string;
};

const defaultForm: ExitRecord = {
  employee_id: "",
  reason: "",
  remarks: "",
  exit_date: "",
};

const unwrapRows = (payload: unknown): ExitRecord[] => {
  if (Array.isArray(payload)) return payload as ExitRecord[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as ExitRecord[];
  }
  return [];
};

export default function LifecycleExitPage() {
  const [rows, setRows] = useState<ExitRecord[]>([]);
  const [form, setForm] = useState<ExitRecord>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const loadRows = async () => {
    try {
      const payload = await adminService.getExitRequests();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[exit] load failed", error);
      toast.error("Failed to load exit records");
    }
  };

  useEffect(() => {
    void loadRows();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.employee_id || !form.reason) {
      toast.error("Employee ID and reason are required");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createExitRequest(form);
      toast.success("Exit request created");
      setForm(defaultForm);
      await loadRows();
    } catch (error) {
      console.error("[exit] create failed", error);
      toast.error("Failed to create exit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <EnterpriseFormSection
        title="Exit Management"
        description="Track exits through /api/exit"
        onSubmit={submit}
        actions={
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Record Exit"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            value={form.employee_id}
            onChange={(event) => setForm((prev) => ({ ...prev, employee_id: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Employee ID"
          />
          <input
            title="Exit date" type="date"
            value={form.exit_date}
            onChange={(event) => setForm((prev) => ({ ...prev, exit_date: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={form.reason}
            onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Reason"
          />
          <input
            value={form.remarks}
            onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Remarks"
          />
        </div>
      </EnterpriseFormSection>

      <EnterpriseTable
        rows={rows}
        emptyLabel="No exit records found"
        rowKey={(row, index) => row.id ?? `${row.employee_id}-${index}`}
        columns={[
          {
            key: "employee",
            header: "Employee",
            render: (row) => row.first_name ? `${row.first_name} ${row.last_name || ""}`.trim() : row.employee_id,
          },
          { key: "reason", header: "Reason", render: (row) => row.reason },
          { key: "exitDate", header: "Exit Date", render: (row) => row.exit_date ? new Date(row.exit_date).toLocaleDateString() : "-" },
          { key: "status", header: "Status", render: (row) => row.status || "Pending" },
        ]}
      />
    </div>
  );
}

