"use client";

import { useEffect, useState } from "react";
import payrollService from "@/services/payrollService";

type PayrollReport = {
  total_employees: number;
  total_salary: number;
  average_salary: number;
  month: string;
  year: number;
};

export default function PayrollReportPage() {
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        // Assuming there's a report endpoint, otherwise use getPayroll
        const data = await payrollService.getPayroll();
        if (Array.isArray(data) && data.length > 0) {
          const totalSalary = data.reduce((sum, item) => sum + (item.salary || 0), 0);
          setReport({
            total_employees: data.length,
            total_salary: totalSalary,
            average_salary: totalSalary / data.length,
            month: data[0].month || "March",
            year: data[0].year || 2026,
          });
        }
      } catch (error) {
        console.error("Failed to load payroll report:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  if (loading) {
    return <div className="p-10">Loading payroll report...</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Payroll Report</h1>

      {report && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Report for {report.month} {report.year}</h2>
          <div className="space-y-2">
            <p><strong>Total Employees:</strong> {report.total_employees}</p>
            <p><strong>Total Salary:</strong> ${report.total_salary}</p>
            <p><strong>Average Salary:</strong> ${report.average_salary.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
