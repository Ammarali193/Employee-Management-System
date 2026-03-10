"use client";

import { useState } from "react";
import performanceService from "@/services/performanceService";

export default function AddPerformance() {
  const [form, setForm] = useState({
    employee_id: "",
    score: "",
    feedback: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await performanceService.addPerformance(form);

    alert("Performance added");
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Add Performance</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="employee_id"
          placeholder="Employee ID"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <input
          name="score"
          placeholder="Score"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <textarea
          name="feedback"
          placeholder="Feedback"
          className="w-full border p-2"
          onChange={handleChange}
        />

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Save
        </button>
      </form>
    </div>
  );
}
