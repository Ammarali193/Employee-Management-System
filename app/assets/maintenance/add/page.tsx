"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import assetService from "@/services/assetService";
import maintenanceService from "@/services/maintenanceService";
import { MAINTENANCE_STATUS } from "@/constants/assetConstants";

type Asset = {
  id: number;
  name: string;
  type: string;
  status: string;
};

export default function AddMaintenancePage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loading, setLoading] = useState(false);

  const [assetId, setAssetId] = useState("");
  const [issue, setIssue] = useState("");
  const [error, setError] = useState("");

  // Load assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const data = await assetService.getAssets();
        setAssets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load assets:", err);
        toast.error("Failed to load assets");
      } finally {
        setLoadingAssets(false);
      }
    };

    loadAssets();
  }, []);

  const isFormComplete = Boolean(assetId && issue.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!assetId) {
      setError("Please select an asset");
      return;
    }

    if (!issue.trim()) {
      setError("Please describe the issue");
      return;
    }

    setLoading(true);

    try {
      await maintenanceService.createMaintenance({
        asset_id: assetId,
        issue: issue.trim(),
        status: MAINTENANCE_STATUS.PENDING,
        reported_date: new Date().toISOString().split("T")[0],
      });

      toast.success("Maintenance request added!");
      router.push("/assets/maintenance");
    } catch (err) {
      const message =
        (err as AxiosError<any>)?.response?.data?.message ||
        "Failed to add maintenance request.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Report Asset Maintenance</h1>
        <Link
          href="/assets/maintenance"
          className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
        >
          Back
        </Link>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        {loadingAssets ? (
          <div className="text-center text-slate-600">Loading assets...</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="asset-select"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Asset <span className="text-red-500">*</span>
              </label>
              <select
                id="asset-select"
                value={assetId}
                onChange={(e) => {
                  setAssetId(e.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                disabled={loading}
                aria-label="Select asset for maintenance"
              >
                <option value="">Select an asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} - {asset.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe the issue or problem with the asset..."
                value={issue}
                onChange={(e) => {
                  setIssue(e.target.value);
                  setError("");
                }}
                rows={5}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!isFormComplete || loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Submitting..." : "Report Maintenance"}
              </button>

              <Link
                href="/assets/maintenance"
                className="rounded-lg border border-slate-300 px-6 py-2 text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
