"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import adminService from "@/services/adminService";
import { EnterpriseTable } from "@/components/ui/enterprise-table";

type AppraisalRecord = {
  id?: number;
  employee_id?: string;
  employee_name?: string;
  review_date?: string;
  result?: string;
  remarks?: string;
};

const unwrapRows = (payload: unknown): AppraisalRecord[] => {
  if (Array.isArray(payload)) return payload as AppraisalRecord[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as AppraisalRecord[];
  }
  return [];
};

export default function PerformanceAppraisalPage() {
  const [rows, setRows] = useState<AppraisalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAppraisals = async () => {
    setLoading(true);
    try {
      const payload = await adminService.getAppraisal();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[appraisal] load failed", error);
      toast.error("Failed to load appraisals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppraisals();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Appraisal Cycle</h2>
          <button
            type="button"
            onClick={() => void loadAppraisals()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </section>

      <EnterpriseTable
        rows={rows}
        emptyLabel="No appraisal records found"
        rowKey={(row, index) => row.id ?? `${row.employee_id ?? "employee"}-${index}`}
        columns={[
          { key: "employee", header: "Employee", render: (row) => row.employee_name || row.employee_id || "-" },
          { key: "date", header: "Review Date", render: (row) => row.review_date ? new Date(row.review_date).toLocaleDateString() : "-" },
          { key: "result", header: "Result", render: (row) => row.result ?? "-" },
          { key: "remarks", header: "Remarks", render: (row) => row.remarks ?? "-" },
        ]}
      />
    </div>
  );
}
