"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseFormSection } from "@/components/ui/enterprise-form-section";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type JobRecord = {
  id?: number;
  title: string;
  department: string;
  location: string;
  description?: string;
  status: string;
};

const unwrapRows = (payload: unknown): JobRecord[] => {
  if (Array.isArray(payload)) return payload as JobRecord[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as JobRecord[];
  }
  return [];
};

const defaultForm: JobRecord = {
  title: "",
  department: "",
  location: "",
  description: "",
  status: "Open",
};

export default function LifecycleJobsPage() {
  const [rows, setRows] = useState<JobRecord[]>([]);
  const [form, setForm] = useState<JobRecord>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const loadJobs = async () => {
    try {
      const payload = await adminService.getJobs();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[jobs] load failed", error);
      toast.error("Failed to load jobs");
    }
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title || !form.department || !form.location) {
      toast.error("Title, department, and location are required");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createJob(form);
      toast.success("Job created");
      setForm(defaultForm);
      await loadJobs();
    } catch (error) {
      console.error("[jobs] create failed", error);
      toast.error("Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <EnterpriseFormSection
        title="Jobs"
        description="Create and track openings via /api/jobs"
        onSubmit={submit}
        actions={
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Create Job"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Job title"
          />
          <input
            value={form.department}
            onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Department"
          />
          <input
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Location"
          />
          <input
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Description"
          />
          <select title="Status"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option>Open</option>
            <option>Closed</option>
          </select>
        </div>
      </EnterpriseFormSection>

      <EnterpriseTable
        rows={rows}
        emptyLabel="No jobs found"
        rowKey={(row, index) => row.id ?? `job-${index}`}
        columns={[
          { key: "title", header: "Title", render: (row) => row.title },
          { key: "department", header: "Department", render: (row) => row.department },
          { key: "location", header: "Location", render: (row) => row.location || "-" },
          { key: "status", header: "Status", render: (row) => row.status },
        ]}
      />
    </div>
  );
}

