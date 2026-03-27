"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import leaveService from "@/services/leaveService";

const applyLeaveSchema = z.object({
  leave_type: z.string().min(1, "Leave type is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
});

type ApplyLeaveFormData = z.infer<typeof applyLeaveSchema>;

export default function ApplyLeavePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplyLeaveFormData>({
    resolver: zodResolver(applyLeaveSchema),
  });

  const onSubmit = async (data: ApplyLeaveFormData) => {
    setLoading(true);
    try {
      await leaveService.applyLeave(data);
      toast.success("Leave application submitted successfully!");
      reset();
      router.push("/leave");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to apply for leave.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Apply for Leave</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>
            <select
              {...register("leave_type")}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="">Select leave type</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="maternity">Maternity Leave</option>
            </select>
            {errors.leave_type && (
              <p className="text-red-600 text-sm mt-1">
                {errors.leave_type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              {...register("start_date")}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
            {errors.start_date && (
              <p className="text-red-600 text-sm mt-1">
                {errors.start_date.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              {...register("end_date")}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
            {errors.end_date && (
              <p className="text-red-600 text-sm mt-1">
                {errors.end_date.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
            <textarea
              {...register("reason")}
              className="w-full p-2 border rounded"
              rows={3}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
