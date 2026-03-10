"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateEmployee() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        department,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Employee created");
      router.push("/employees");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="p-10">
      <h2 className="mb-6 text-2xl font-bold">Create Employee</h2>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
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
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Department"
          onChange={(e) => setDepartment(e.target.value)}
        />

        <button className="rounded bg-blue-500 px-4 py-2 text-white">
          Add Employee
        </button>
      </form>
    </div>
  );
}
