"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseFormSection } from "@/components/ui/enterprise-form-section";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type OnboardingRecord = {
  id?: number;
  employee_id: string;
  employee_name?: string;
  start_date?: string;
  mentor?: string;
  checklist_notes?: string;
  status?: string;
};

const defaultForm: OnboardingRecord = {
  employee_id: "",
  start_date: "",
  mentor: "",
  checklist_notes: "",
  status: "Pending",
};

const unwrapRows = (payload: unknown): OnboardingRecord[] => {
  if (Array.isArray(payload)) return payload as OnboardingRecord[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as OnboardingRecord[];
  }
  return [];
};

export default function LifecycleOnboardingPage() {
  const [rows, setRows] = useState<OnboardingRecord[]>([]);
  const [form, setForm] = useState<OnboardingRecord>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const loadRows = async () => {
    try {
      const payload = await adminService.getOnboarding();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[onboarding] load failed", error);
      toast.error("Failed to load onboarding records");
    }
  };

  useEffect(() => {
    void loadRows();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.employee_id || !form.start_date) {
      toast.error("Employee ID and start date are required");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createOnboarding(form);
      toast.success("Onboarding flow started");
      setForm(defaultForm);
      await loadRows();
    } catch (error) {
      console.error("[onboarding] create failed", error);
      toast.error("Failed to start onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <EnterpriseFormSection
        title="Onboarding"
        description="Create onboarding entries with /api/onboarding"
        onSubmit={submit}
        actions={
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Start Onboarding"}
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
            title="Start date" type="date"
            value={form.start_date}
            onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={form.mentor}
            onChange={(event) => setForm((prev) => ({ ...prev, mentor: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Mentor"
          />
          <input
            value={form.checklist_notes}
            onChange={(event) => setForm((prev) => ({ ...prev, checklist_notes: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Checklist notes"
          />
        </div>
      </EnterpriseFormSection>

      <EnterpriseTable
        rows={rows}
        emptyLabel="No onboarding records found"
        rowKey={(row, index) => row.id ?? `${row.employee_id}-${index}`}
        columns={[
          { key: "employee", header: "Employee", render: (row) => row.employee_name || row.employee_id },
          { key: "start", header: "Start Date", render: (row) => row.start_date ? new Date(row.start_date).toLocaleDateString() : "-" },
          { key: "mentor", header: "Mentor", render: (row) => row.mentor || "-" },
          { key: "status", header: "Status", render: (row) => row.status || "Pending" },
        ]}
      />
    </div>
  );
}

