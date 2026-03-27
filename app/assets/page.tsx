"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import assetService from "@/services/assetService";
import { ASSET_STATUS } from "@/constants/assetConstants";

type Asset = {
  id: number;
  name: string;
  type: string;
  status: string;
  assigned_to?: string;
};

type EditingAsset = {
  id: number;
  name: string;
  type: string;
} | null;

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingAsset, setEditingAsset] = useState<EditingAsset>(null);
  const router = useRouter();

  const filteredAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.name?.toLowerCase().includes(search.toLowerCase()) ||
          asset.type?.toLowerCase().includes(search.toLowerCase())
      ),
    [assets, search]
  );

  const loadAssets = async () => {
    try {
      const data = await assetService.getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleEdit = (asset: Asset) => {
    setEditingAsset({
      id: asset.id,
      name: asset.name,
      type: asset.type,
    });
  };

  const resetForm = () => {
    setEditingAsset(null);
  };

  const updateAsset = async () => {
    if (!editingAsset || !editingAsset.name || !editingAsset.type) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await assetService.updateAsset(editingAsset.id, {
        name: editingAsset.name,
        type: editingAsset.type,
      });

      // Optimistic update: update local state instead of full refetch
      setAssets((prev) =>
        prev.map((a) =>
          a.id === editingAsset.id
            ? { ...a, name: editingAsset.name, type: editingAsset.type }
            : a
        )
      );

      resetForm();
    } catch (error) {
      console.error("Failed to update asset:", error);
      alert("Failed to update asset");
    }
  };

  const deleteAsset = async (id: number) => {
    if (!confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    try {
      await assetService.deleteAsset(id);

      // Optimistic update: remove from local state instead of full refetch
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Failed to delete asset:", error);
      alert("Failed to delete asset");
    }
  };

  const isFormComplete = editingAsset?.name && editingAsset?.type;

  if (loading) {
    return <div className="p-10">Loading assets...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Asset Management</h1>
        <div className="space-x-2">
          <Link
            href="/assets/add"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Add Asset
          </Link>
          <Link
            href="/assets/assign"
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            Assign Asset
          </Link>
          <Link
            href="/assets/maintenance"
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Maintenance
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search assets by name or type..."
        className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Edit Form */}
      {editingAsset !== null && (
        <div className="mb-6 rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 font-semibold text-slate-900">Edit Asset</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Asset Name
              <input
                type="text"
                value={editingAsset.name}
                onChange={(e) =>
                  setEditingAsset({ ...editingAsset, name: e.target.value })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Asset Type
              <input
                type="text"
                value={editingAsset.type}
                onChange={(e) =>
                  setEditingAsset({ ...editingAsset, type: e.target.value })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={updateAsset}
              disabled={!isFormComplete}
              className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Update Asset
            </button>

            <button
              onClick={resetForm}
              className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Assets Table */}
      {filteredAssets.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-600">
          {assets.length === 0
            ? "No assets found. Add your first asset to get started!"
            : "No assets match your search."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full bg-white">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Name
                </th>
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Type
                </th>
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="p-3 text-left text-sm font-semibold text-slate-900">
                  Assigned To
                </th>
                <th className="p-3 text-center text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b transition-colors hover:bg-slate-50"
                >
                  <td className="p-3 text-sm text-slate-900">{asset.name}</td>
                  <td className="p-3 text-sm text-slate-900">{asset.type}</td>
                  <td className="p-3 text-sm">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        asset.status === ASSET_STATUS.AVAILABLE
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-900">
                    {asset.assigned_to ? (
                      <span className="font-medium text-blue-700">
                        {asset.assigned_to}
                      </span>
                    ) : (
                      <span className="text-slate-400">Not Assigned</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleEdit(asset)}
                      className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs text-white transition-colors hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-600"
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
    </div>
  );
}
