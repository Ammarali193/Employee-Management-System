"use client";

import { useEffect, useState } from "react";
import payrollService from "@/services/payrollService";

type PayslipRecord = {
  id: number;
  employee_name: string;
  salary: number;
  month: string;
  year: number;
  net_salary: number;
};

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayslips = async () => {
      try {
        const data = await payrollService.getPayroll();
        setPayslips(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load payslips:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayslips();
  }, []);

  if (loading) {
    return <div className="p-10">Loading payslips...</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">All Payslips</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Gross Salary</th>
            <th className="border p-2">Net Salary</th>
            <th className="border p-2">Month</th>
            <th className="border p-2">Year</th>
          </tr>
        </thead>
        <tbody>
          {payslips.map((payslip) => (
            <tr key={payslip.id}>
              <td className="border p-2">{payslip.employee_name}</td>
              <td className="border p-2">${payslip.salary}</td>
              <td className="border p-2">${payslip.net_salary || payslip.salary}</td>
              <td className="border p-2">{payslip.month}</td>
              <td className="border p-2">{payslip.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
