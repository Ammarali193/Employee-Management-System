"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseFormSection } from "@/components/ui/enterprise-form-section";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type FeedbackRecord = {
  id?: number;
  employee_id: string;
  employee_name?: string;
  feedback: string;
  rating: number;
};

const unwrapRows = (payload: unknown): FeedbackRecord[] => {
  if (Array.isArray(payload)) return payload as FeedbackRecord[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as FeedbackRecord[];
  }
  return [];
};

const initialForm: FeedbackRecord = {
  employee_id: "",
  feedback: "",
  rating: 5,
};

export default function PerformanceFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRecord[]>([]);
  const [form, setForm] = useState<FeedbackRecord>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const loadFeedback = async () => {
    try {
      const payload = await adminService.getFeedback();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[feedback] load failed", error);
      toast.error("Failed to load feedback");
    }
  };

  useEffect(() => {
    void loadFeedback();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.employee_id || !form.feedback) {
      toast.error("Employee ID and feedback are required");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createFeedback(form);
      toast.success("Feedback submitted");
      setForm(initialForm);
      await loadFeedback();
    } catch (error) {
      console.error("[feedback] create failed", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = useMemo(() => {
    if (!rows.length) return 0;
    const total = rows.reduce((sum, row) => sum + Number(row.rating || 0), 0);
    return (total / rows.length).toFixed(1);
  }, [rows]);

  return (
    <div className="space-y-6 p-4">
      <EnterpriseFormSection
        title="Feedback System"
        description="Submit employee feedback with ratings using /api/feedback"
        onSubmit={submit}
        actions={
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            value={form.employee_id}
            onChange={(event) => setForm((prev) => ({ ...prev, employee_id: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Employee ID"
          />
          <input
            value={form.feedback}
            onChange={(event) => setForm((prev) => ({ ...prev, feedback: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Feedback"
          />
          <select title="Rating"
            value={form.rating}
            onChange={(event) => setForm((prev) => ({ ...prev, rating: Number(event.target.value) }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
      </EnterpriseFormSection>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Ratings Summary</h3>
        <p className="mt-2 text-sm text-slate-600">
          Average Rating: <span className="font-semibold text-slate-900">{averageRating}</span> / 5
        </p>
      </section>

      <EnterpriseTable
        rows={rows}
        emptyLabel="No feedback records found"
        rowKey={(row, index) => row.id ?? `${row.employee_id}-${index}`}
        columns={[
          { key: "employee", header: "Employee", render: (row) => row.employee_name || row.employee_id },
          { key: "feedback", header: "Feedback", render: (row) => row.feedback },
          {
            key: "rating",
            header: "Rating",
            render: (row) => (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                {row.rating}/5
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}

