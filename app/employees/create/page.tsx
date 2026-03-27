"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import employeeService from "@/services/employeeService";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type EmployeeForm = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  department: string;
  shift: string;
  workType: string;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as ApiError;

    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export default function CreateEmployee() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<EmployeeForm>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    department: "",
    shift: "",
    workType: "office",
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await employeeService.createEmployee(form);
      toast.success("Employee added successfully!");
      router.push("/employees");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add employee."));
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = Boolean(
    form.first_name.trim() &&
      form.last_name.trim() &&
      form.email.trim() &&
      form.password,
  );

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Create Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="first_name"
          placeholder="First Name"
          className="w-full border p-2"
          value={form.first_name}
          onChange={handleChange}
          disabled={submitting}
        />

        <input
          name="last_name"
          placeholder="Last Name"
          className="w-full border p-2"
          value={form.last_name}
          onChange={handleChange}
          disabled={submitting}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-2"
          value={form.email}
          onChange={handleChange}
          disabled={submitting}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          value={form.password}
          onChange={handleChange}
          disabled={submitting}
        />

        <input
          name="department"
          placeholder="Department"
          className="w-full border p-2"
          value={form.department}
          onChange={handleChange}
          disabled={submitting}
        />

        <select
          name="workType"
          className="w-full border p-2"
          value={form.workType}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="office">Office</option>
          <option value="remote">Remote</option>
        </select>

        <select
          name="shift"
          className="w-full border p-2"
          value={form.shift}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="">Select Shift</option>
          <option value="morning">Morning</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
        </select>

        <button
          disabled={!isFormComplete || submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Adding..." : "Add Employee"}
        </button>
      </form>
    </div>
  );
}
