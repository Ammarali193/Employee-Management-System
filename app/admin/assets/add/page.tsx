"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddAsset() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [serial, setSerial] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      name,
      type,
      serial,
    });

    alert("Asset Added");

    router.push("/admin/assets");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Add Asset</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-96">
        <input
          type="text"
          placeholder="Asset Name"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Asset Type"
          className="border p-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />

        <input
          type="text"
          placeholder="Serial Number"
          className="border p-2"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
        />

        <button className="bg-blue-500 text-white p-2 rounded">
          Add Asset
        </button>
      </form>
    </div>
  );
}