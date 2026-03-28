"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseFormSection } from "@/components/ui/enterprise-form-section";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type Policy = {
  id?: number;
  policy_name: string;
  description: string;
  created_at?: string;
};

const unwrapRows = (payload: unknown): Policy[] => {
  if (Array.isArray(payload)) return payload as Policy[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as Policy[];
  }
  return [];
};

const defaultForm: Policy = {
  policy_name: "",
  description: "",
};

export default function CompliancePoliciesPage() {
  const [rows, setRows] = useState<Policy[]>([]);
  const [form, setForm] = useState<Policy>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const payload = await adminService.getCompliancePolicies();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[compliance-policies] load failed", error);
      toast.error("Failed to load compliance policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPolicies();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.policy_name || !form.description) {
      toast.error("Policy name and description are required");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createCompliancePolicy(form);
      toast.success("Policy created");
      setForm(defaultForm);
      await loadPolicies();
    } catch (error) {
      console.error("[compliance-policies] create failed", error);
      toast.error("Failed to create policy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <EnterpriseFormSection
        title="Compliance Policies"
        description="Manage policies via /api/compliance/policies"
        onSubmit={submit}
        actions={
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Create Policy"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={form.policy_name}
            onChange={(event) => setForm((prev) => ({ ...prev, policy_name: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Policy name"
          />
          <input
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Description"
          />
        </div>
      </EnterpriseFormSection>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">Policy List</h3>
          <button
            type="button"
            onClick={() => void loadPolicies()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <EnterpriseTable
          rows={rows}
          emptyLabel="No compliance policies found"
          rowKey={(row, index) => row.id ?? `policy-${index}`}
          columns={[
            { key: "policy", header: "Policy Name", render: (row) => row.policy_name },
            { key: "description", header: "Description", render: (row) => row.description },
            {
              key: "created",
              header: "Created",
              render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
            },
          ]}
        />
      </section>
    </div>
  );
}
