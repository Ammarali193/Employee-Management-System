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
  phone: string;
  gender: string;
  date_of_birth: string;
  department: string;
  role: string;
  shift: string;
  joining_date: string;
  password: string;
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

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500";

const labelClassName = "mb-1 block text-sm text-gray-600";

export default function CreateEmployee() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<EmployeeForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    department: "",
    role: "",
    shift: "",
    joining_date: "",
    password: "",
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
      form.department.trim() &&
      form.role.trim() &&
      form.shift.trim() &&
      form.password,
  );

  return (
    <div className="bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
        <header>
          <h1 className="text-2xl font-bold text-gray-800">Add Employee</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter personal, professional, and security details to create a new employee profile.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Personal Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="first_name" className={labelClassName}>
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="last_name" className={labelClassName}>
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClassName}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className={labelClassName}>
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                  placeholder="e.g. +92 300 0000000"
                />
              </div>

              <div>
                <label htmlFor="gender" className={labelClassName}>
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="date_of_birth" className={labelClassName}>
                  Date of Birth
                </label>
                <input
                  id="date_of_birth"
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Professional Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="department" className={labelClassName}>
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className={labelClassName}>
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="shift" className={labelClassName}>
                  Shift
                </label>
                <select
                  id="shift"
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                  required
                >
                  <option value="">Select Shift</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div>
                <label htmlFor="joining_date" className={labelClassName}>
                  Joining Date
                </label>
                <input
                  id="joining_date"
                  type="date"
                  name="joining_date"
                  value={form.joining_date}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Security</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="password" className={labelClassName}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={submitting}
                  required
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={!isFormComplete || submitting}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Adding Employee..." : "Add Employee"}
          </button>
        </form>
      </div>
    </div>
  );
}
