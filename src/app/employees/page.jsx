"use client";

import { useEffect, useState } from "react";
import employeeService from "@/services/employeeService";
import Link from "next/link";

export default function Employees() {
  const [employees, setEmployees] = useState([]);

  const loadEmployees = async () => {
    const data = await employeeService.getEmployees();
    setEmployees(data.employees);
  };

  useEffect(() => {
    const run = async () => {
      await loadEmployees();
    };

    void run();
  }, []);

  const handleDelete = async (id) => {
    await employeeService.deleteEmployee(id);

    await loadEmployees();
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>

        <Link
          href="/employees/create"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Add Employee
        </Link>
      </div>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Department</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="border-t">
              <td className="p-2">{emp.id}</td>
              <td className="p-2">
                {emp.first_name} {emp.last_name}
              </td>
              <td className="p-2">{emp.email}</td>
              <td className="p-2">{emp.department}</td>

              <td className="p-2">
                <button
                  onClick={() => handleDelete(emp.id)}
                  className="rounded bg-red-500 px-2 py-1 text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
