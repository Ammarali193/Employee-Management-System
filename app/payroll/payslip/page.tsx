"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import payrollService from "@/services/payrollService";

const payslipSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
});

type PayslipFormData = z.infer<typeof payslipSchema>;

type PayslipData = {
  employee_name: string;
  salary: number;
  month: string;
  year: number;
  deductions: number;
  net_salary: number;
};

export default function PayslipPage() {
  const [payslip, setPayslip] = useState<PayslipData | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PayslipFormData>({
    resolver: zodResolver(payslipSchema),
  });

  const onSubmit = async (data: PayslipFormData) => {
    setLoading(true);
    try {
      const result = await payrollService.getPayslip(data.employee_id);
      setPayslip(result);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to fetch payslip.";
      toast.error(message);
      setPayslip(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">View Payslip</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            {...register("employee_id")}
            placeholder="Enter Employee ID"
            className="p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Loading..." : "Get Payslip"}
          </button>
        </div>
        {errors.employee_id && (
          <p className="text-red-600 text-sm mt-1">
            {errors.employee_id.message}
          </p>
        )}
      </form>

      {payslip && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Payslip</h2>
          <div className="space-y-2">
            <p><strong>Employee:</strong> {payslip.employee_name}</p>
            <p><strong>Month:</strong> {payslip.month} {payslip.year}</p>
            <p><strong>Gross Salary:</strong> ₨{(payslip.salary || 0).toLocaleString()}</p>
             <p><strong>Deductions:</strong> ₨{(payslip.deductions || 0).toLocaleString()}</p>
            <p><strong>Net Salary:</strong> ₨{(payslip.net_salary || 0).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
