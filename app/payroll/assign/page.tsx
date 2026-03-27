"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import payrollService from "@/services/payrollService";
import employeeService from "@/services/employeeService";

const assignSalarySchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  basic_salary: z.number().min(1, "Basic salary must be greater than 0"),
  allowance: z.number().min(0, "Allowance must be non-negative").default(0),
  deduction: z.number().min(0, "Deduction must be non-negative").default(0),
  month: z.string().min(1, "Month is required"),
  year: z.number().min(2000, "Year must be valid"),
});

type AssignSalaryFormData = z.infer<typeof assignSalarySchema>;

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
};

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function AssignSalaryPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [calculatedNetSalary, setCalculatedNetSalary] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
  } = useForm<AssignSalaryFormData>({
    resolver: zodResolver(assignSalarySchema),
    mode: "onChange",
    defaultValues: {
      allowance: 0,
      deduction: 0,
    },
  });

  const basicSalary = watch("basic_salary") || 0;
  const allowance = watch("allowance") || 0;
  const deduction = watch("deduction") || 0;

  // Calculate net salary in real-time
  useMemo(() => {
    const net = Number(basicSalary) + Number(allowance) - Number(deduction);
    setCalculatedNetSalary(Math.max(0, net));
  }, [basicSalary, allowance, deduction]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeService.getEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load employees:", error);
        toast.error("Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const onSubmit = async (data: AssignSalaryFormData) => {
    try {
      const payload = {
        employee_id: data.employee_id,
        basic_salary: data.basic_salary,
        allowance: data.allowance,
        deduction: data.deduction,
        net_salary: calculatedNetSalary,
        month: `${data.year}-${data.month}`,
      };

      await payrollService.assignSalary(payload);
      toast.success("Salary assigned successfully!");
      reset();
      router.push("/payroll");
    } catch (error) {
      const message =
        (error as AxiosError<any>)?.response?.data?.message ||
        "Failed to assign salary.";
      toast.error(message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assign Salary to Employee</h1>
        <Link
          href="/payroll"
          className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
        >
          Back
        </Link>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        {loadingEmployees ? (
          <div className="text-center text-slate-600">Loading employees...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                {...register("employee_id")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                disabled={isSubmitting}
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                    {emp.email ? ` (${emp.email})` : ""}
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.employee_id.message}
                </p>
              )}
            </div>

            {/* Salary Components */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Basic Salary */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Basic Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  {...register("basic_salary", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  disabled={isSubmitting}
                />
                {errors.basic_salary && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.basic_salary.message}
                  </p>
                )}
              </div>

              {/* Allowance */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Allowance
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  {...register("allowance", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  disabled={isSubmitting}
                />
                {errors.allowance && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.allowance.message}
                  </p>
                )}
              </div>

              {/* Deduction */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deduction
                </label>
                <input
                  type="number"
                  placeholder="2000"
                  {...register("deduction", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  disabled={isSubmitting}
                />
                {errors.deduction && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.deduction.message}
                  </p>
                )}
              </div>
            </div>

            {/* Net Salary Display */}
            <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Net Salary:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ₨{calculatedNetSalary.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Basic Salary:</span>
                  <span>₨{Number(basicSalary || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>+ Allowance:</span>
                  <span className="text-green-600">
                    +₨{Number(allowance || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>- Deduction:</span>
                  <span className="text-red-600">
                    -₨{Number(deduction || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Month & Year */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Month <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("month")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  disabled={isSubmitting}
                >
                  <option value="">Select month</option>
                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {errors.month && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.month.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("year", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  disabled={isSubmitting}
                >
                  <option value="">Select year</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.year.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "Assigning..." : "Assign Salary"}
              </button>

              <Link
                href="/payroll"
                className="rounded-lg border border-slate-300 px-6 py-2 text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
