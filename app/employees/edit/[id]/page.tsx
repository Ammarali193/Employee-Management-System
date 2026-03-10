"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";

export default function EditEmployee() {
  const params = useParams<{ id: string }>();

  const id = params?.id ?? "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        department,
        password,
      }),
    });

    if (res.ok) {
      alert("Employee updated");
    }
  };

  return (
    <div className="p-10">
      <h1 className="mb-6 text-2xl font-bold">Edit Employee</h1>

      <form onSubmit={handleUpdate} className="max-w-md space-y-4">
        <input
          className="w-full border p-2"
          placeholder="First Name"
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Last Name"
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Department"
          onChange={(e) => setDepartment(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="rounded bg-green-500 px-4 py-2 text-white">
          Update Employee
        </button>
      </form>
    </div>
  );
}
