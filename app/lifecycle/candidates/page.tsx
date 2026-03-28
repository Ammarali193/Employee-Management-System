"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseFormSection } from "@/components/ui/enterprise-form-section";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type CandidateRecord = {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  job_id: string;
  status: string;
};

const unwrapRows = (payload: unknown): CandidateRecord[] => {
  if (Array.isArray(payload)) return payload as CandidateRecord[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as CandidateRecord[];
  }
  return [];
};

const defaultForm: CandidateRecord = {
  name: "",
  email: "",
  phone: "",
  resume_url: "",
  job_id: "",
  status: "Applied",
};

export default function LifecycleCandidatesPage() {
  const [rows, setRows] = useState<CandidateRecord[]>([]);
  const [form, setForm] = useState<CandidateRecord>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const loadCandidates = async () => {
    try {
      const payload = await adminService.getCandidates();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[candidates] load failed", error);
      toast.error("Failed to load candidates");
    }
  };

  useEffect(() => {
    void loadCandidates();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.job_id) {
      toast.error("Name, email, and job ID are required");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createCandidate(form);
      toast.success("Candidate added");
      setForm(defaultForm);
      await loadCandidates();
    } catch (error) {
      console.error("[candidates] create failed", error);
      toast.error("Failed to add candidate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <EnterpriseFormSection
        title="Candidates"
        description="Manage applicants via /api/candidates"
        onSubmit={submit}
        actions={
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Add Candidate"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Candidate name"
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Email"
          />
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Phone"
          />
          <input
            value={form.resume_url}
            onChange={(event) => setForm((prev) => ({ ...prev, resume_url: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Resume URL"
          />
          <input
            value={form.job_id}
            onChange={(event) => setForm((prev) => ({ ...prev, job_id: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Job ID"
          />
          <select title="Status"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option>Applied</option>
            <option>Screening</option>
            <option>Interview</option>
            <option>Selected</option>
            <option>Rejected</option>
          </select>
        </div>
      </EnterpriseFormSection>

      <EnterpriseTable
        rows={rows}
        emptyLabel="No candidates found"
        rowKey={(row, index) => row.id ?? `candidate-${index}`}
        columns={[
          { key: "name", header: "Name", render: (row) => row.name },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "job", header: "Job ID", render: (row) => row.job_id },
          { key: "status", header: "Status", render: (row) => row.status },
        ]}
      />
    </div>
  );
}

