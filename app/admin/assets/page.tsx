"use client";

import Link from "next/link";
import { useState } from "react";

export default function AssetsPage() {
  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Laptop",
      type: "Electronics",
      status: "Assigned",
      employee: "Ali Khan",
    },
    {
      id: 2,
      name: "Phone",
      type: "Electronics",
      status: "Available",
      employee: "-",
    },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assets</h1>

      <div className="mb-4 flex gap-3">
        <Link
          href="/admin/assets/add"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Asset
        </Link>

        <Link
          href="/admin/assets/assign"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Assign Asset
        </Link>

        <Link
          href="/admin/assets/history"
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Asset History
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Employee</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} className="text-center border-t">
              <td className="p-2">{asset.id}</td>
              <td>{asset.name}</td>
              <td>{asset.type}</td>
              <td>{asset.status}</td>
              <td>{asset.employee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}