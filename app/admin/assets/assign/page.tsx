"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignAsset() {
  const router = useRouter();

  const [asset, setAsset] = useState("");
  const [employee, setEmployee] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      asset,
      employee,
    });

    alert("Asset Assigned");

    router.push("/admin/assets");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Assign Asset</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-96">
        <input
          type="text"
          placeholder="Asset Name"
          className="border p-2"
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
        />

        <input
          type="text"
          placeholder="Employee Name"
          className="border p-2"
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
        />

        <button className="bg-green-500 text-white p-2 rounded">
          Assign Asset
        </button>
      </form>
    </div>
  );
}