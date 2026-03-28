"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "../../services/api";

type Employee = {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  department?: string;
};

const PAGE_SIZE = 10;

const getEmployeesArray = (payload: unknown): Employee[] => {
  if (Array.isArray(payload)) {
    return payload as Employee[];
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.employees)) return record.employees as Employee[];
    if (Array.isArray(record.data)) return record.data as Employee[];
    if (Array.isArray(record.items)) return record.items as Employee[];
  }

  return [];
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("employee");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const storedRole = String(localStorage.getItem("role") || "employee").toLowerCase();
    setRole(storedRole);
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (role === "employee") {
      setEmployees([]);
      setError("You do not have access to view the employee directory.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/employees");
      setEmployees(getEmployeesArray(response.data));
    } catch (loadError) {
      console.error("[employees] Failed to load", loadError);
      setError("Unable to load employees");
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const canManageEmployees = role === "admin" || role === "hr";
  const canDeleteEmployees = role === "admin";

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const fullName = `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim();
      const fallbackName = employee.name ?? fullName;

      return (
        fallbackName.toLowerCase().includes(keyword) ||
        String(employee.email ?? "").toLowerCase().includes(keyword) ||
        String(employee.department ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [employees, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const paginatedEmployees = filteredEmployees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success("Employee deleted");
      await loadEmployees();
    } catch (deleteError) {
      console.error("[employees] Delete failed", deleteError);
      toast.error("Unable to delete employee");
    }
  };

  return (
    <div className="space-y-6 bg-gray-100 p-6">
      <section className="rounded-2xl bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage employee records, search quickly, and perform actions in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, department"
              className="w-72 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-600"
            />
            {canManageEmployees ? (
              <button
                type="button"
                onClick={() => router.push("/employees/add")}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Add Employee
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-md">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((employee) => {
                  const fullName =
                    `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim() ||
                    employee.name ||
                    "-";

                  return (
                    <tr key={employee.id} className="border-t border-gray-200 transition hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{employee.email ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{employee.department ?? "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {canManageEmployees ? (
                            <button
                              type="button"
                              onClick={() => router.push(`/employees/edit/${employee.id}`)}
                              className="rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                          ) : null}
                          {canDeleteEmployees ? (
                            <button
                              type="button"
                              onClick={() => void handleDelete(employee.id)}
                              className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                      No employees found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredEmployees.length)} of {filteredEmployees.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1.5 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
