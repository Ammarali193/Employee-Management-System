"use client";

import { useEffect, useState } from "react";
import advancedService from "@/services/advancedService";

export default function HistoryPage({ params }: { params: { employee_id: string } }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await advancedService.getHistory(params.employee_id);
      setRows(Array.isArray(data) ? data : []);
    };

    void load();
  }, [params.employee_id]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Employment History</h1>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border p-4">
            <div className="text-sm text-slate-500">{row.change_date ? new Date(row.change_date).toLocaleDateString() : "-"}</div>
            <div className="text-lg font-semibold">{row.role}</div>
            <div className="text-sm">Department: {row.department || "-"}</div>
            <div className="text-sm">Change Type: {row.change_type || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
