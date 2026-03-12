"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import employeeService from "@/services/employeeService";

export default function EditEmployee() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const employeeId = typeof params?.id === "string" ? params.id : "";

  const [employee, setEmployee] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    password: "",
  });
  const [shiftId, setShiftId] = useState("1");

  useEffect(() => {
    const loadEmployee = async () => {
      if (!employeeId) {
        return;
      }

      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
      const data = await res.json();

      setEmployee({
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        department: data.department ?? "",
        password: "",
      });
      setShiftId(String(data.shift_id ?? "1"));
    };

    void loadEmployee();
  }, [employeeId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value,
    });
  };

  const saveEmployee = async () => {
    if (!employeeId) {
      return;
    }

    await employeeService.updateEmployee(employeeId, {
      ...employee,
      shift_id: Number(shiftId),
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await saveEmployee();

    router.push("/employees");
  };

  const handleAssignShift = async () => {
    await saveEmployee();
    alert("Shift assigned successfully");
  };

  return (
    <div className="p-6 max-w-md">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/employees"
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold">Edit Employee</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="first_name"
          value={employee.first_name}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full border p-2"
        />

        <input
          name="last_name"
          value={employee.last_name}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full border p-2"
        />

        <input
          name="email"
          value={employee.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border p-2"
        />

        <input
          name="department"
          value={employee.department}
          onChange={handleChange}
          placeholder="Department"
          className="w-full border p-2"
        />

        <input
          name="password"
          value={employee.password}
          onChange={handleChange}
          type="password"
          placeholder="New Password (optional)"
          className="w-full border p-2"
        />

        <select
          value={shiftId}
          onChange={(e) => setShiftId(e.target.value)}
          className="w-full border p-2"
        >
          <option value="1">Morning</option>
          <option value="2">Evening</option>
          <option value="3">Night</option>
        </select>

        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Update Employee
          </button>

          <button
            type="button"
            onClick={handleAssignShift}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Assign Shift
          </button>
        </div>
      </form>
    </div>
  );
}
