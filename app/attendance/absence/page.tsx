"use client";

import { useEffect, useState } from "react";

type AbsentEmployee = {
  id: number | string;
  name?: string | null;
};

export default function AbsencePage() {
  const [data, setData] = useState<AbsentEmployee[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:5000/api/attendance/absence");
      const result = await res.json();

      setData(Array.isArray(result) ? result : []);
    };

    void load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">Absent Employees</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Employee ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((emp) => (
            <tr key={emp.id} className="border-t">
              <td className="p-2">{emp.id}</td>
              <td className="p-2">{emp.name ?? "-"}</td>
              <td className="text-red-600 font-semibold">Absent</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
