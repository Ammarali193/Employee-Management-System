"use client";

import { useState } from "react";
import employeeService from "@/services/employeeService";
import { useRouter } from "next/navigation";

export default function CreateEmployee() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    department: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await employeeService.createEmployee(form);

    router.push("/employees");
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Add Employee</h1>

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

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Create
        </button>
      </form>
    </div>
  );
}
