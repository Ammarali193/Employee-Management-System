"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

type Employee = {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
};

type PerformanceRecord = {
  id: number;
  employee_id?: number;
  employee_name?: string;
  review_period?: string;
  rating?: number;
  comments?: string;
};

type PerformanceForm = {
  employee_id: string;
  review_period: string;
  rating: string;
  comments: string;
};

const PAGE_SIZE = 10;

const extractArray = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data as Record<string, unknown>[];
    if (Array.isArray(data.items)) return data.items as Record<string, unknown>[];
    if (Array.isArray(data.records)) return data.records as Record<string, unknown>[];
    if (Array.isArray(data.employees)) return data.employees as Record<string, unknown>[];
    if (Array.isArray(data.performance)) return data.performance as Record<string, unknown>[];
  }

  return [];
};

const emptyForm: PerformanceForm = {
  employee_id: "",
  review_period: "",
  rating: "",
  comments: "",
};

const getRatingColor = (rating: number | undefined) => {
  if (!rating) return "bg-gray-100 text-gray-700";
  if (rating >= 4) return "bg-green-100 text-green-700";
  if (rating >= 3) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const getRatingStars = (rating: number | undefined) => {
  if (!rating) return "—";
  const fullStars = Math.floor(rating);
  const hasStar = rating % 1 >= 0.5;
  let stars = "⭐".repeat(fullStars);
  if (hasStar) stars += "✨";
  return stars;
};

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500";

export default function PerformancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [form, setForm] = useState<PerformanceForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterRating, setFilterRating] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [employeesRes, performanceRes] = await Promise.all([
        api.get("/employees"),
        api.get("/performance"),
      ]);

      setEmployees(extractArray(employeesRes.data) as Employee[]);
      setRecords(extractArray(performanceRes.data) as PerformanceRecord[]);
    } catch (loadError) {
      console.error("[performance] Failed to load", loadError);
      setError("Unable to load performance data");
      toast.error("Performance data load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const addRating = async () => {
    if (!form.employee_id || !form.review_period || !form.rating) {
      toast.error("Employee, review period, and rating are required");
      return;
    }

    try {
      await api.post("/performance/add", {
        employee_id: Number(form.employee_id),
        review_period: form.review_period,
        rating: Number(form.rating),
        comments: form.comments,
      });

      toast.success("Performance rating added");
      setForm(emptyForm);
      await loadData();
    } catch (saveError) {
      console.error("[performance] Add failed", saveError);
      toast.error("Unable to add performance rating");
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = (record.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesPeriod = !filterPeriod || record.review_period === filterPeriod;
      const matchesRating = !filterRating || record.rating === Number(filterRating);
      return matchesSearch && matchesPeriod && matchesRating;
    });
  }, [records, searchTerm, filterPeriod, filterRating]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const paginatedRecords = useMemo(
    () => filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredRecords, page],
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const uniquePeriods = useMemo(
    () => [...new Set(records.map((r) => r.review_period).filter(Boolean))],
    [records],
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-slate-900">Performance</h1>
          <p className="mt-2 text-base text-slate-600">Manage and track employee performance ratings and feedback</p>
        </div>

        {/* Add Rating Section */}
        <section className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Add Rating & Feedback</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Employee */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Employee</label>
              <select
                value={form.employee_id}
                onChange={(event) => setForm((prev) => ({ ...prev, employee_id: event.target.value }))}
                aria-label="Select employee"
                className={inputClassName}
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => {
                  const label =
                    `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim() ||
                    employee.name ||
                    `Employee #${employee.id}`;
                  return (
                    <option key={employee.id} value={employee.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Review Period */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Review Period</label>
              <input
                value={form.review_period}
                onChange={(event) => setForm((prev) => ({ ...prev, review_period: event.target.value }))}
                placeholder="e.g. Q1-2026"
                className={inputClassName}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
                placeholder="Rating between 1-5"
                className={inputClassName}
              />
            </div>

            {/* Feedback (Full Width) */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Feedback Optional</label>
              <input
                type="text"
                value={form.comments}
                onChange={(event) => setForm((prev) => ({ ...prev, comments: event.target.value }))}
                placeholder="Brief feedback or notes"
                className={inputClassName}
              />
            </div>
          </div>

          {/* Full Width Textarea */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Detailed Comments</label>
            <textarea
              value={form.comments}
              onChange={(event) => setForm((prev) => ({ ...prev, comments: event.target.value }))}
              placeholder="Add detailed feedback, strengths, areas for improvement..."
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => void addRating()}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700 transition"
          >
            Save Rating
          </button>
        </section>

        {/* Performance Records Section */}
        <section className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h2 className="text-xl font-bold text-slate-900">Performance Records</h2>
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Refresh
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <input
                type="text"
                placeholder="Search employee name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className={inputClassName}
              />
            </div>
            <div>
              <select
                value={filterPeriod}
                onChange={(e) => {
                  setFilterPeriod(e.target.value);
                  setPage(1);
                }}
                className={inputClassName}
              >
                <option value="">All Periods</option>
                {uniquePeriods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterRating}
                onChange={(e) => {
                  setFilterRating(e.target.value);
                  setPage(1);
                }}
                className={inputClassName}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {/* Loading State */}
          {loading ? (
            <div className="py-12 text-center text-slate-600">
              <p>Loading performance records...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Employee Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Review Period</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Rating</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                          {searchTerm || filterPeriod || filterRating
                            ? "No records match your filters"
                            : "No performance records found"}
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((record, index) => (
                        <tr
                          key={record.id ?? `performance-${index}`}
                          className="border-t border-slate-200 transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {record.employee_name || "No Data"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {record.review_period || "No Data"}
                          </td>
                          <td className="px-6 py-4 text-center text-sm">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-flex rounded-full px-3 py-1 font-semibold ${getRatingColor(record.rating)}`}>
                                {record.rating || "—"}/5
                              </span>
                              <span className="text-xs">{getRatingStars(record.rating)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                            {record.comments || "No Data"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRecords.length > 0 ? (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                  <span className="text-sm text-slate-600">
                    Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredRecords.length)} of{" "}
                    {filteredRecords.length} records
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
