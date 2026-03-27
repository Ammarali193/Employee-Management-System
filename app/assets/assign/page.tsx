"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import assetService from "@/services/assetService";
import employeeService from "@/services/employeeService";
import { ASSET_STATUS } from "@/constants/assetConstants";

const assignAssetSchema = z.object({
  asset_id: z.string().min(1, "Asset is required"),
  employee_id: z.string().min(1, "Employee is required"),
  assignment_date: z.string().min(1, "Assignment date is required"),
});

type AssignAssetFormData = z.infer<typeof assignAssetSchema>;

type Asset = {
  id: number;
  name: string;
  type: string;
  status: string;
  assigned_to?: string;
};

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
};

export default function AssignAssetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<AssignAssetFormData>({
    resolver: zodResolver(assignAssetSchema),
    mode: "onChange",
  });

  const selectedAssetId = watch("asset_id");

  // Memoize the asset lookup to avoid O(n) search on every render
  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === Number(selectedAssetId)),
    [assets, selectedAssetId]
  );

  const isAssetNotAvailable =
    selectedAsset?.status !== ASSET_STATUS.AVAILABLE;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assetsData, employeesData] = await Promise.all([
          assetService.getAssets(),
          employeeService.getEmployees(),
        ]);

        setAssets(Array.isArray(assetsData) ? assetsData : []);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load assets or employees");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const onSubmit = async (data: AssignAssetFormData) => {
    if (isAssetNotAvailable) {
      toast.error("Only available assets can be assigned");
      return;
    }

    setLoading(true);
    try {
      await assetService.assignAsset({
        asset_id: data.asset_id,
        employee_id: data.employee_id,
        assignment_date: data.assignment_date,
      });
      toast.success("Asset assigned successfully!");
      router.push("/assets");
    } catch (error) {
      const message =
        (error as AxiosError<any>)?.response?.data?.message ||
        "Failed to assign asset.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assign Asset</h1>
        <Link
          href="/assets"
          className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
        >
          Back
        </Link>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        {loadingData ? (
          <div className="text-center text-slate-600">Loading assets and employees...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Asset Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Asset <span className="text-red-500">*</span>
              </label>
              <select
                {...register("asset_id")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                disabled={loading}
              >
                <option value="">Select an asset</option>
                {assets.map((asset) => (
                  <option
                    key={asset.id}
                    value={asset.id}
                    disabled={asset.status !== ASSET_STATUS.AVAILABLE}
                  >
                    {asset.name} - {asset.type} (
                    {asset.status === ASSET_STATUS.AVAILABLE
                      ? "Available"
                      : "Assigned"}
                    )
                  </option>
                ))}
              </select>
              {errors.asset_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.asset_id.message}
                </p>
              )}
              {isAssetNotAvailable && selectedAssetId && (
                <p className="mt-1 text-sm text-yellow-600">
                  This asset is already assigned
                </p>
              )}
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                {...register("employee_id")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                disabled={loading}
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                    {employee.email ? ` (${employee.email})` : ""}
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.employee_id.message}
                </p>
              )}
            </div>

            {/* Assignment Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assignment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("assignment_date")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.assignment_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.assignment_date.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={
                  loading || !isValid || isAssetNotAvailable
                }
                className="rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Assigning..." : "Assign Asset"}
              </button>

              <Link
                href="/assets"
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

