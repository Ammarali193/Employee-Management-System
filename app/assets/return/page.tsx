"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import assetService from "@/services/assetService";

type Asset = {
  id: number;
  name: string;
  description?: string;
  serial_number?: string;
  assigned_to?: string;
  condition?: string;
  return_date?: string;
};

const PAGE_SIZE = 10;

export default function ReturnAssetPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data: any = await assetService.getAssets();
      const assetArray = Array.isArray(data) ? data : data?.assets || data?.data || [];
      const assignedAssets = assetArray.filter((a: any) => a.assigned_to || a.status === "assigned");
      setAssets(assignedAssets);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to load assets";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (assetId: number) => {
    if (!confirm("Are you sure you want to return this asset?")) return;

    try {
      await assetService.returnAsset(assetId);
      toast.success("Asset returned successfully");
      loadAssets();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to return asset";
      toast.error(message);
    }
  };

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return assets.slice(start, start + PAGE_SIZE);
  }, [assets, currentPage]);

  const totalPages = Math.ceil(assets.length / PAGE_SIZE);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Return Assets</h1>
        <Link href="/assets" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Back to Assets
        </Link>
      </div>

      {assets.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded text-yellow-800">
          No assigned assets found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Asset Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Serial Number</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Assigned To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Condition</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset: any) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{asset.name}</td>
                    <td className="px-6 py-3">{asset.serial_number || "-"}</td>
                    <td className="px-6 py-3">{asset.assigned_to || "-"}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        asset.condition === "good" ? "bg-green-100 text-green-800" :
                        asset.condition === "fair" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {asset.condition || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleReturn(asset.id)}
                        className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-xs"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
