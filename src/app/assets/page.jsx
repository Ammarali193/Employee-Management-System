"use client";

import { useEffect, useState } from "react";
import assetService from "@/services/assetService";

export default function Assets() {
  const [assets, setAssets] = useState([]);

  const loadAssets = async () => {
    const data = await assetService.getAssets();

    setAssets(data.assets);
  };

  useEffect(() => {
    void loadAssets();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Asset Inventory</h1>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Type</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2">{a.id}</td>
              <td className="p-2">{a.name}</td>
              <td className="p-2">{a.type}</td>
              <td className="p-2">{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
