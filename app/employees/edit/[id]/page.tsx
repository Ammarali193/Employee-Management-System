"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import employeeService from "@/services/employeeService";
import { toast } from "react-hot-toast";

const extractApiMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export default function EditEmployee() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const employeeId = typeof params?.id === "string" ? params.id : "";

  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    password: "",
  });
  const [shiftId, setShiftId] = useState("1");

  useEffect(() => {
    const loadEmployee = async () => {
      if (!employeeId) {
        return;
      }

      try {
        const data = await employeeService.getEmployee(employeeId);

        setEmployee({
          firstName: data.first_name ?? data.firstName ?? "",
          lastName: data.last_name ?? data.lastName ?? "",
          email: data.email ?? "",
          department: data.department ?? "",
          password: "",
        });
        setShiftId(String(data.shift_id ?? "1"));
      } catch (error) {
        console.error("[employees/edit] failed to load employee", error);
        toast.error("Employee not found");
        router.push("/employees");
      }
    };

    void loadEmployee();
  }, [employeeId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value,
    });
  };

  const compactPayload = (payload: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    );

  const saveEmployee = async () => {
    if (!employeeId) {
      return;
    }

    try {
      const payload = compactPayload({
        firstName: employee.firstName.trim() || undefined,
        lastName: employee.lastName.trim() || undefined,
        email: employee.email.trim() || undefined,
        department: employee.department.trim() || undefined,
        password: employee.password.trim() || undefined,
        shift_id: shiftId ? Number(shiftId) : undefined,
      });

      await employeeService.updateEmployee(employeeId, payload);
      toast.success("Employee updated successfully");
    } catch (error) {
      console.error("[employees/edit] update failed", error);
      toast.error(extractApiMessage(error, "Unable to update employee"));
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await saveEmployee();

    router.push("/employees");
  };

  const handleAssignShift = async () => {
    if (!employeeId || !shiftId) {
      toast.error("Select a shift first");
      return;
    }

    try {
      await employeeService.updateEmployee(employeeId, {
        shift_id: Number(shiftId),
      });
      toast.success("Shift assigned successfully");
    } catch (error) {
      console.error("[employees/edit] assign shift failed", error);
      toast.error(extractApiMessage(error, "Unable to assign shift"));
    }
  };

  return (
    <div className="p-6 max-w-md">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/employees"
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold">Edit Employee</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="firstName"
          value={employee.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full border p-2"
        />

        <input
          name="lastName"
          value={employee.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full border p-2"
        />

        <input
          name="email"
          value={employee.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border p-2"
        />

        <input
          name="department"
          value={employee.department}
          onChange={handleChange}
          placeholder="Department"
          className="w-full border p-2"
        />

        <input
          name="password"
          value={employee.password}
          onChange={handleChange}
          type="password"
          placeholder="New Password (optional)"
          className="w-full border p-2"
        />

        <select
          value={shiftId}
          onChange={(e) => setShiftId(e.target.value)}
          title="Select Shift"
          aria-label="Select Shift"
          className="w-full border p-2"
        >
          <option value="1">Morning</option>
          <option value="2">Evening</option>
          <option value="3">Night</option>
        </select>

        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Update Employee
          </button>

          <button
            type="button"
            onClick={handleAssignShift}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Assign Shift
          </button>
        </div>
      </form>
    </div>
  );
}
