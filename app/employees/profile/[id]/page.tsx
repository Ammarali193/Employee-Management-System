"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Employee = {
  name?: string | null;
  email?: string | null;
  department?: string | null;
  status?: string | null;
};

export default function EmployeeProfile() {
  const params = useParams<{ id: string }>();
  const employeeId = typeof params?.id === "string" ? params.id : "";
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      if (!employeeId) {
        return;
      }

      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        headers,
      });
      const data = await res.json();

      setEmployee(data?.employee ?? data);
    };

    void loadEmployee();
  }, [employeeId]);

  if (!employee) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/employees"
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold">Employee Profile</h1>
      </div>

      <p>
        <b>Name:</b> {employee.name}
      </p>
      <p>
        <b>Email:</b> {employee.email}
      </p>
      <p>
        <b>Department:</b> {employee.department}
      </p>
      <p>
        <b>Status:</b> {employee.status}
      </p>
    </div>
  );
}
