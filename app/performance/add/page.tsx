"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import performanceService from "@/services/performanceService";

const addPerformanceSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  review_period: z.string().min(1, "Review period is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comments: z.string().optional(),
});

type AddPerformanceFormData = z.infer<typeof addPerformanceSchema>;

export default function AddPerformancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddPerformanceFormData>({
    resolver: zodResolver(addPerformanceSchema),
  });

  const onSubmit = async (data: AddPerformanceFormData) => {
    setLoading(true);
    try {
      await performanceService.addPerformance(data);
      toast.success("Performance record added successfully!");
      reset();
      router.push("/performance");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to add performance record.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Add Performance Record</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Employee ID</label>
            <input
              type="text"
              {...register("employee_id")}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
            {errors.employee_id && (
              <p className="text-red-600 text-sm mt-1">
                {errors.employee_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review Period</label>
            <input
              type="text"
              {...register("review_period")}
              className="w-full p-2 border rounded"
              placeholder="e.g., Q1 2024"
              disabled={loading}
            />
            {errors.review_period && (
              <p className="text-red-600 text-sm mt-1">
                {errors.review_period.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              {...register("rating", { valueAsNumber: true })}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
            {errors.rating && (
              <p className="text-red-600 text-sm mt-1">
                {errors.rating.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
            <textarea
              {...register("comments")}
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
            {loading ? "Adding..." : "Add Performance Record"}
          </button>
        </form>
      </div>
    </div>
  );
}
