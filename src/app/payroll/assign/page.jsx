"use client";

import { useState } from "react";
import payrollService from "@/services/payrollService";

export default function AssignSalary() {
  const [form, setForm] = useState({
    employee_id: "",
    basic_salary: "",
    allowances: "",
    deductions: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await payrollService.assignSalary(form);

    alert("Salary assigned successfully");
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Assign Salary</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="employee_id"
          placeholder="Employee ID"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="basic_salary"
          placeholder="Basic Salary"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="allowances"
          placeholder="Allowances"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="deductions"
          placeholder="Deductions"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Assign Salary
        </button>
      </form>
    </div>
  );
}
