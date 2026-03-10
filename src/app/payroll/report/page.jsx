"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function PayrollReport() {
  const [records, setRecords] = useState([]);

  const loadReport = async () => {
    const res = await api.get("/payroll/report/monthly");

    setRecords(res.data.payroll_report);
  };

  useEffect(() => {
    void loadReport();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Monthly Payroll Report</h1>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Employee</th>
            <th className="p-2">Basic</th>
            <th className="p-2">Allowance</th>
            <th className="p-2">Deduction</th>
            <th className="p-2">Net Salary</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">
                {r.first_name} {r.last_name}
              </td>

              <td className="p-2">{r.basic_salary}</td>
              <td className="p-2">{r.allowances}</td>
              <td className="p-2">{r.deductions}</td>
              <td className="p-2">{r.net_salary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
