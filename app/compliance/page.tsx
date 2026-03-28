"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import complianceService from "@/services/complianceService";
import { EnterpriseFormSection } from "@/components/ui/enterprise-form-section";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type Policy = {
  id?: number;
  policy_name: string;
  description: string;
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

export default function CompliancePage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [form, setForm] = useState<Policy>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const payload = await complianceService.getPolicies();
      setPolicies(unwrapRows(payload));
    } catch (error) {
      console.error("[compliance] load failed", error);
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
      await complianceService.createPolicy(form);
      toast.success("Policy created");
      setForm(defaultForm);
      await loadPolicies();
    } catch (error) {
      console.error("[compliance] create failed", error);
      toast.error("Failed to create policy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <EnterpriseFormSection
        title="Compliance Policies"
        description="Create and manage policies via /api/compliance/policies"
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
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
          rows={policies}
          emptyLabel="No compliance policies found"
          rowKey={(row, index) => row.id ?? `policy-${index}`}
          columns={[
            { key: "policy", header: "Policy Name", render: (row) => row.policy_name },
            { key: "description", header: "Description", render: (row) => row.description },
          ]}
        />
      </section>
    </div>
  );
}
