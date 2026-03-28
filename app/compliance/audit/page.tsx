"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import advancedService from "../../../services/advancedService";
import { EnterpriseTable } from "../../../components/ui/enterprise-table";

type AuditLog = {
  id?: number;
  user?: string;
  user_name?: string;
  module?: string;
  action?: string;
  created_at?: string;
};

const unwrapRows = (payload: unknown): AuditLog[] => {
  if (Array.isArray(payload)) return payload as AuditLog[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as AuditLog[];
  }
  return [];
};

export default function ComplianceAuditPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [userFilter, setUserFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const payload = await advancedService.getAuditLogs();
      setRows(unwrapRows(payload));
    } catch (error) {
      console.error("[audit] load failed", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const modules = Array.from(
    new Set(rows.map((row) => String(row.module ?? "")).filter(Boolean)),
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const user = String(row.user_name ?? row.user ?? "").toLowerCase();
      const userMatch = user.includes(userFilter.toLowerCase().trim());
      const moduleMatch = moduleFilter === "all" || String(row.module ?? "") === moduleFilter;
      return userMatch && moduleMatch;
    });
  }, [rows, userFilter, moduleFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
            placeholder="Filter by user"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            title="Filter by module"
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All Modules</option>
            {modules.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void loadLogs()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {loading ? "Loading..." : "Refresh Logs"}
          </button>
        </div>
      </section>

      <EnterpriseTable
        rows={filtered}
        emptyLabel="No audit logs found"
        rowKey={(row: AuditLog, index: number) => row.id ?? `audit-${index}`}
        columns={[
          {
            key: "user",
            header: "User",
            render: (row: AuditLog) => row.user_name ?? row.user ?? "-",
          },
          {
            key: "module",
            header: "Module",
            render: (row: AuditLog) => row.module ?? "-",
          },
          {
            key: "action",
            header: "Action",
            render: (row: AuditLog) => row.action ?? "-",
          },
          {
            key: "time",
            header: "Timestamp",
            render: (row: AuditLog) => row.created_at ?? "-",
          },
        ]}
      />
    </div>
  );
}
