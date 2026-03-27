"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import assetService from "@/services/assetService";

const addAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required").trim(),
  type: z.string().min(1, "Asset type is required").trim(),
});

type AddAssetFormData = z.infer<typeof addAssetSchema>;

export default function AddAsset() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AddAssetFormData>({
    resolver: zodResolver(addAssetSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: AddAssetFormData) => {
    try {
      await assetService.createAsset(data);
      toast.success("Asset added successfully!");
      router.push("/assets");
    } catch (error) {
      const message =
        (error as AxiosError<any>)?.response?.data?.message ||
        "Failed to add asset.";
      toast.error(message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Asset</h1>
        <Link
          href="/assets"
          className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
        >
          Back
        </Link>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Laptop, Monitor, Chair"
              {...register("name")}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Asset Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Electronics, Furniture, Equipment"
              {...register("type")}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              disabled={isSubmitting}
            />
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Adding..." : "Add Asset"}
            </button>

            <Link
              href="/assets"
              className="rounded-lg border border-slate-300 px-6 py-2 text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

