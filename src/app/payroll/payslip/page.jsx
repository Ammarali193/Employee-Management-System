"use client";

import { useState } from "react";
import payrollService from "@/services/payrollService";

export default function Payslip() {
  const [employeeId, setEmployeeId] = useState("");
  const [data, setData] = useState(null);

  const loadPayslip = async () => {
    const res = await payrollService.getPayslip(employeeId);

    setData(res);
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Payslip</h1>

      <input
        placeholder="Employee ID"
        className="mb-4 w-full border p-2"
        onChange={(e) => setEmployeeId(e.target.value)}
      />

      <button
        onClick={loadPayslip}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Generate Payslip
      </button>

      {data && (
        <div className="mt-6 bg-white p-4 shadow">
          <p>Employee: {data.employee_name}</p>
          <p>Basic Salary: {data.basic_salary}</p>
          <p>Present Days: {data.present_days}</p>
          <p>Leave Days: {data.approved_leave_days}</p>
          <p>Final Salary: {data.final_salary}</p>
        </div>
      )}
    </div>
  );
}
