"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string | null;
};

async function fetchEmployees(): Promise<Employee[]> {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/employees", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return Array.isArray(data) ? data : [];
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const loadEmployees = async () => {
    const data = await fetchEmployees();
    setEmployees(data);
  };

  useEffect(() => {
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
      await loadEmployees();
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

      <input
        type="text"
        placeholder="Search employee..."
        className="mb-4 rounded border p-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.map((emp) => (
            <tr key={emp.id}>
              <td className="border p-2">{emp.id}</td>

              <td className="border p-2">{emp.name}</td>

              <td className="border p-2">{emp.email}</td>

              <td className="border p-2">{emp.department ?? "-"}</td>

              <td className="space-x-2 border p-2">
                <Link
                  href={`/employees/profile/${emp.id}`}
                  className="rounded bg-green-500 px-2 py-1 text-white"
                >
                  View
                </Link>

                <Link
                  href={`/employees/edit/${emp.id}`}
                  className="rounded bg-yellow-500 px-2 py-1 text-white"
                >
                  Edit
                </Link>

                <button
                  className="rounded bg-red-500 px-2 py-1 text-white"
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
