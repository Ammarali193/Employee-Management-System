"use client";

import { useEffect, useState } from "react";
import advancedService from "@/services/advancedService";

export default function TenantsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("Basic");
  const [status, setStatus] = useState("Active");

  const load = async () => {
    const data = await advancedService.getTenants();
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    void load();
  }, []);

  const createTenant = async () => {
    if (!name) return;
    await advancedService.createTenant({ name, plan, status });
    setName("");
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tenants</h1>

      <div className="rounded-xl border p-4">
        <input className="border p-2 mr-2" placeholder="Tenant name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 mr-2" placeholder="Plan" value={plan} onChange={(e) => setPlan(e.target.value)} />
        <select className="border p-2 mr-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button onClick={createTenant} className="bg-blue-600 text-white px-4 py-2">Create</button>
      </div>

      <table className="w-full border">
        <thead><tr><th>Name</th><th>Plan</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}><td>{row.name}</td><td>{row.plan}</td><td>{row.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
