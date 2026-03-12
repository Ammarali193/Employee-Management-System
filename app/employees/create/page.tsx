"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import employeeService from "@/services/employeeService";

export default function CreateEmployee() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    department: "",
  });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

interface EmployeeForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  department: string;
}

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await employeeService.createEmployee(form);

    alert("Employee added successfully");

    router.push("/employees");
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Create Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="first_name"
          placeholder="First Name"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="last_name"
          placeholder="Last Name"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="department"
          placeholder="Department"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Employee
        </button>
      </form>
    </div>
  );
}
