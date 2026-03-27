"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import maintenanceService from "@/services/maintenanceService";
import assetService from "@/services/assetService";
import {
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_COLORS,
} from "@/constants/assetConstants";

type Maintenance = {
  id: number;
  asset_id: number;
  issue: string;
  status: string;
  reported_date: string;
  resolved_date?: string;
};

type Asset = {
  id: number;
  name: string;
  type: string;
};

export default function MaintenancePage() {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const asset = assets.find((a) => a.id === record.asset_id);
        const assetName = asset?.name?.toLowerCase() || "";
        const issue = record.issue?.toLowerCase() || "";
        const searchLower = search.toLowerCase();

        return (
          assetName.includes(searchLower) || issue.includes(searchLower)
        );
      }),
    [records, assets, search]
  );

  const loadData = async () => {
    try {
      const [maintenanceData, assetsData] = await Promise.all([
        maintenanceService.getMaintenanceRecords(),
        assetService.getAssets(),
      ]);

      setRecords(Array.isArray(maintenanceData) ? maintenanceData : []);
      setAssets(Array.isArray(assetsData) ? assetsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load maintenance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAssetName = (assetId: number) => {
    const asset = assets.find((a) => a.id === assetId);
    return asset ? `${asset.name} (${asset.type})` : `Asset #${assetId}`;
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const updateData: Record<string, any> = { status: newStatus };

      if (newStatus === MAINTENANCE_STATUS.RESOLVED) {
        updateData.resolved_date = new Date().toISOString().split("T")[0];
      }

      await maintenanceService.updateMaintenance(id, updateData);

      // Optimistic update
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updateData } : r))
      );

      toast.success(`Maintenance marked as ${newStatus}`);
    } catch (error) {
      console.error("Failed to update maintenance:", error);
      toast.error("Failed to update maintenance record");
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) {
      return;
    }

    try {
      await maintenanceService.deleteMaintenance(id);

      // Optimistic update
      setRecords((prev) => prev.filter((r) => r.id !== id));

      toast.success("Maintenance record deleted");
    } catch (error) {
      console.error("Failed to delete maintenance:", error);
      toast.error("Failed to delete maintenance record");
    }
  };

  if (loading) {
    return <div className="p-10">Loading maintenance records...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Asset Maintenance</h1>
        <Link
          href="/assets/maintenance/add"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Report Maintenance
        </Link>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by asset name or issue..."
        className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Maintenance Records Table */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-600">
          {records.length === 0
            ? "No maintenance records found. Report an issue to get started!"
            : "No maintenance records match your search."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full bg-white">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Asset
                </th>
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Issue
                </th>
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Reported Date
                </th>
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Resolved Date
                </th>
                <th className="p-3 text-center text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b transition-colors hover:bg-slate-50"
                >
                  <td className="p-3 text-sm font-medium text-slate-900">
                    {getAssetName(record.asset_id)}
                  </td>
                  <td className="p-3 text-sm text-slate-700">
                    {record.issue}
                  </td>
                  <td className="p-3 text-sm">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        MAINTENANCE_STATUS_COLORS[
                          record.status as keyof typeof MAINTENANCE_STATUS_COLORS
                        ] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {record.reported_date}
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {record.resolved_date || "-"}
                  </td>
                  <td className="p-3 text-center">
                    {record.status !== MAINTENANCE_STATUS.RESOLVED && (
                      <>
                        {record.status === MAINTENANCE_STATUS.PENDING && (
                          <button
                            onClick={() =>
                              updateStatus(
                                record.id,
                                MAINTENANCE_STATUS.IN_PROGRESS
                              )
                            }
                            className="rounded-lg bg-orange-500 px-2 py-1.5 text-xs text-white transition-colors hover:bg-orange-600 mr-2"
                            type="button"
                          >
                            Start
                          </button>
                        )}

                        <button
                          onClick={() =>
                            updateStatus(record.id, MAINTENANCE_STATUS.RESOLVED)
                          }
                          className="rounded-lg bg-green-500 px-2 py-1.5 text-xs text-white transition-colors hover:bg-green-600 mr-2"
                          type="button"
                        >
                          Resolve
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="rounded-lg bg-red-500 px-2 py-1.5 text-xs text-white transition-colors hover:bg-red-600"
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Legend */}
      <div className="mt-8 rounded-lg bg-slate-50 p-4">
        <h3 className="mb-3 font-semibold text-slate-900">Status Guide:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
              Pending
            </span>
            <span className="text-sm text-slate-600">Issue reported, not started</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              In Progress
            </span>
            <span className="text-sm text-slate-600">Maintenance work in progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              Resolved
            </span>
            <span className="text-sm text-slate-600">Issue fixed and resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
