"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

type LeaveRequest = {
  id: number;
  employee_name?: string;
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  status?: string;
};

type LeaveForm = {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
};

const PAGE_SIZE = 10;

const extractLeaves = (payload: unknown): LeaveRequest[] => {
  if (Array.isArray(payload)) return payload as LeaveRequest[];

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.leaves)) return data.leaves as LeaveRequest[];
    if (Array.isArray(data.leave_requests)) return data.leave_requests as LeaveRequest[];
    if (Array.isArray(data.data)) return data.data as LeaveRequest[];
  }

  return [];
};

const emptyForm: LeaveForm = {
  leave_type: "",
  start_date: "",
  end_date: "",
  reason: "",
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LeaveForm>(emptyForm);

  const loadLeaves = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoints = ["/leave/all", "/leave", "/leaves", "/leave/requests", "/leave-requests"];
      let data: unknown = [];

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          data = response.data;
          break;
        } catch {
          continue;
        }
      }

      setLeaves(extractLeaves(data));
    } catch (loadError) {
      console.error("[leaves] Failed to load", loadError);
      setError("Unable to load leave requests");
      toast.error("Leave requests load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLeaves();
  }, []);

  const paginatedLeaves = useMemo(
    () => leaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [leaves, page],
  );
  const totalPages = Math.max(1, Math.ceil(leaves.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleApplyLeave = async () => {
    if (!form.leave_type || !form.start_date || !form.end_date) {
      toast.error("Leave type, start date, and end date are required");
      return;
    }

    setSaving(true);

    try {
      await api.post("/leave/apply", form);
      toast.success("Leave applied successfully");
      setForm(emptyForm);
      await loadLeaves();
    } catch (saveError) {
      console.error("[leaves] Apply failed", saveError);
      toast.error("Unable to apply leave");
    } finally {
      setSaving(false);
    }
  };

  const updateLeaveStatus = async (id: number, action: "approve" | "reject") => {
    try {
      await api.put(`/leave/${action}/${id}`);
      toast.success(action === "approve" ? "Leave approved" : "Leave rejected");
      await loadLeaves();
    } catch (actionError) {
      console.error(`[leaves] ${action} failed`, actionError);
      toast.error(`Unable to ${action} leave`);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-900">Apply Leave</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={form.leave_type}
            onChange={(event) => setForm((prev) => ({ ...prev, leave_type: event.target.value }))}
            title="Select leave type"
            aria-label="Select leave type"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select Leave Type</option>
            <option value="annual">Annual</option>
            <option value="sick">Sick</option>
            <option value="casual">Casual</option>
          </select>
          <input
            type="date"
            value={form.start_date}
            onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
            title="Start date"
            aria-label="Start date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.end_date}
            onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
            title="End date"
            aria-label="End date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={form.reason}
            onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
            placeholder="Reason"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleApplyLeave()}
          disabled={saving}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Submitting..." : "Submit Leave"}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Leave Management</h2>
          <button
            type="button"
            onClick={() => void loadLeaves()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-600">Loading leave requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Employee</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Start Date</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">End Date</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaves.map((leave, index) => (
                  <tr key={leave.id ?? `leave-${index}`} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-sm text-slate-700">{leave.employee_name ?? "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{leave.leave_type ?? "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{leave.start_date ?? "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{leave.end_date ?? "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{leave.status ?? "-"}</td>
                    <td className="px-3 py-2 text-sm">
                      {String(leave.status ?? "").toLowerCase() === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void updateLeaveStatus(leave.id, "approve")}
                            className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => void updateLeaveStatus(leave.id, "reject")}
                            className="rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}

                {paginatedLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                      No leave requests found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, leaves.length)} of {leaves.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
