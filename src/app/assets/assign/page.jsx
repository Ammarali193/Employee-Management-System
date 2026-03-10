"use client";

import { useEffect, useState } from "react";
import assetService from "@/services/assetService";
import employeeService from "@/services/employeeService";

export default function AssignAssetPage() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assetId, setAssetId] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const loadAssets = async () => {
    const data = await assetService.getAssets();

    setAssets(data.assets);
  };

  const loadEmployees = async () => {
    const data = await employeeService.getEmployees();

    setEmployees(data.employees);
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([loadAssets(), loadEmployees()]);
    };

    void run();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();

    await assetService.assignAsset({
      asset_id: assetId,
      employee_id: employeeId,
    });

    alert("Asset Assigned");
  };

  return (
    <form onSubmit={handleAssign}>
      <h1 className="mb-4 text-xl font-bold">Assign Asset</h1>

      <select
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
        className="mb-4 w-full border p-2"
      >
        <option value="">Select Asset</option>

        {assets.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.name} - {asset.model} ({asset.serial_number})
          </option>
        ))}
      </select>

      <select
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        className="mb-4 w-full border p-2"
      >
        <option value="">Select Employee</option>

        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name || `${emp.first_name} ${emp.last_name}`.trim()}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Assign
      </button>
    </form>
  );
}
