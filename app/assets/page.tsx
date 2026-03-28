"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

type Asset = {
  id: number;
  name?: string;
  type?: string;
  status?: string;
  assigned_to?: string;
};

type Employee = {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
};

const PAGE_SIZE = 10;

const extractArray = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.assets)) return data.assets as Record<string, unknown>[];
    if (Array.isArray(data.employees)) return data.employees as Record<string, unknown>[];
    if (Array.isArray(data.data)) return data.data as Record<string, unknown>[];
    if (Array.isArray(data.items)) return data.items as Record<string, unknown>[];
  }

  return [];
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [assetId, setAssetId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [assignmentDate, setAssignmentDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [assetsRes, employeesRes] = await Promise.all([
        api.get("/assets"),
        api.get("/employees"),
      ]);

      setAssets(extractArray(assetsRes.data) as Asset[]);
      setEmployees(extractArray(employeesRes.data) as Employee[]);
    } catch (loadError) {
      console.error("[assets] Failed to load", loadError);
      setError("Unable to load assets data");
      toast.error("Assets load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const assignAsset = async () => {
    if (!assetId || !employeeId || !assignmentDate) {
      toast.error("Please select asset, employee, and assignment date");
      return;
    }

    try {
      await api.post("/assets/assign", {
        asset_id: Number(assetId),
        employee_id: Number(employeeId),
        assignment_date: assignmentDate,
      });

      toast.success("Asset assigned successfully");
      setAssetId("");
      setEmployeeId("");
      setAssignmentDate("");
      await loadData();
    } catch (assignError) {
      console.error("[assets] Assign failed", assignError);
      toast.error("Unable to assign asset");
    }
  };

  const filteredAssets = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return assets.filter((asset) => {
      return (
        String(asset.name ?? "").toLowerCase().includes(keyword) ||
        String(asset.type ?? "").toLowerCase().includes(keyword) ||
        String(asset.status ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [assets, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const paginatedAssets = filteredAssets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-900">Assign Asset</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={assetId}
            onChange={(event) => setAssetId(event.target.value)}
            title="Select asset"
            aria-label="Select asset"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select Asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name ?? `Asset #${asset.id}`}
              </option>
            ))}
          </select>

          <select
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            title="Select employee"
            aria-label="Select employee"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
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

          <input
            type="date"
            value={assignmentDate}
            onChange={(event) => setAssignmentDate(event.target.value)}
            title="Assignment date"
            aria-label="Assignment date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={() => void assignAsset()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Assign
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Asset Status</h2>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assets"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-600">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset, index) => (
                  <tr key={asset.id ?? `asset-${index}`} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-sm text-slate-700">{asset.name ?? "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{asset.type ?? "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{asset.status ?? "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{asset.assigned_to ?? "Not assigned"}</td>
                  </tr>
                ))}
                {paginatedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                      No assets found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredAssets.length)} of {filteredAssets.length}
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
