"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
};

async function fetchEmployees(): Promise<Employee[]> {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/employees", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return Array.isArray(data.employees) ? data.employees : [];
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadEmployees = async () => {
      const data = await fetchEmployees();
      setEmployees(data);
    };

    void loadEmployees();
  }, []);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert("Employee deleted");
      const data = await fetchEmployees();
      setEmployees(data);
    }
  };

  return (
    <div className="p-10">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>

        <button
          onClick={() => router.push("/employees/create")}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Add Employee
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td className="border p-2">
                {emp.first_name} {emp.last_name}
              </td>

              <td className="border p-2">{emp.email}</td>

              <td className="border p-2">{emp.department}</td>

              <td className="space-x-2 border p-2">
                <button
                  className="rounded bg-yellow-500 px-3 py-1 text-white"
                  onClick={() => router.push(`/employees/edit/${emp.id}`)}
                >
                  Edit
                </button>

                <button
                  className="rounded bg-red-500 px-3 py-1 text-white"
                  onClick={() => handleDelete(emp.id)}
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
