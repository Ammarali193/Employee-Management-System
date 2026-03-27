"use client";

import { useState } from "react";

export default function AssetHistory() {
  const [history] = useState([
    {
      id: 1,
      asset: "Laptop",
      employee: "Ali Khan",
      issue: "10-03-2026",
      returnDate: "15-03-2026",
    },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Asset History</h1>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Asset</th>
            <th>Employee</th>
            <th>Issue Date</th>
            <th>Return Date</th>
          </tr>
        </thead>

        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="text-center border-t">
              <td className="p-2">{h.asset}</td>
              <td>{h.employee}</td>
              <td>{h.issue}</td>
              <td>{h.returnDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}