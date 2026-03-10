"use client";

import { useEffect, useState } from "react";
import payrollService from "@/services/payrollService";

export default function Payroll() {
  const [records, setRecords] = useState([]);

  const loadPayroll = async () => {
    try {
      const data = await payrollService.getPayroll();

      setRecords(
        Array.isArray(data?.payroll) ? data.payroll : Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(err);
      setRecords([]);
    }
  };

  useEffect(() => {
    void loadPayroll();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Payroll</h1>

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
          {records.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center">
                No payroll records
              </td>
            </tr>
          ) : (
            records.map((r, i) => (
              <tr key={`${r.id}-${i}`} className="border-t">
                <td className="p-2">{r.first_name}</td>
                <td className="p-2">{Number(r.basic).toLocaleString()}</td>
                <td className="p-2">
                  {Number(r.allowances ?? r.allowance).toLocaleString()}
                </td>
                <td className="p-2">
                  {Number(r.deductions ?? r.deduction).toLocaleString()}
                </td>
                <td className="p-2">{Number(r.net_salary).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
