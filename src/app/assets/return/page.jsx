"use client";

import { useState } from "react";
import assetService from "@/services/assetService";

export default function ReturnAsset() {
  const [form, setForm] = useState({
    asset_id: "",
    employee_id: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await assetService.returnAsset(form);

    alert("Asset returned");
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Return Asset</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="asset_id"
          placeholder="Asset ID"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="employee_id"
          placeholder="Employee ID"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <button className="rounded bg-green-600 px-4 py-2 text-white">
          Return
        </button>
      </form>
    </div>
  );
}
