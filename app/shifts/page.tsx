"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import shiftService from "@/services/shiftService";
import employeeService from "@/services/employeeService";

type Shift = {
  id: number | string;
  name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
};

type Assignment = {
  id?: number | string;
  employee_id?: number | string;
  shift_id?: number | string;
  employee_name?: string | null;
  shift_name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
};

type Employee = {
  id: number | string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

type ShiftResponse = {
  shifts?: Shift[];
};

type AssignmentResponse = {
  assignments?: Assignment[];
};

type EmployeeResponse = {
  employees?: Employee[];
};

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500";

const buttonBaseClassName =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50";

const formatShiftTime = (time?: string | null) => {
  if (!time) return "--";

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;

    return new Date(`1970-01-01T${normalizedTime}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return time;
};

const getEmployeeName = (employee: Employee) =>
  (employee?.name || `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim() || "Unknown") as string;

const getAssignmentStatus = (assignment: Assignment) => {
  const status = String(assignment.status || "Active").trim().toLowerCase();
  return status === "inactive" ? "Inactive" : "Active";
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [start_time, setStartTime] = useState("");
  const [end_time, setEndTime] = useState("");
  const [employee_id, setEmployeeId] = useState("");
  const [shift_id, setShiftId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const [data, assignmentData, employeeData] = await Promise.all([
        shiftService.getShifts(),
        shiftService.getAssignments(),
        employeeService.getEmployees(),
      ]);

      const normalizedShifts = Array.isArray(data)
        ? data
        : Array.isArray((data as ShiftResponse)?.shifts)
          ? ((data as ShiftResponse).shifts ?? [])
          : [];

      const normalizedAssignments = Array.isArray(assignmentData)
        ? assignmentData
        : Array.isArray((assignmentData as AssignmentResponse)?.assignments)
          ? ((assignmentData as AssignmentResponse).assignments ?? [])
          : [];

      const normalizedEmployees = Array.isArray(employeeData)
        ? employeeData
        : Array.isArray((employeeData as EmployeeResponse)?.employees)
          ? ((employeeData as EmployeeResponse).employees ?? [])
          : [];

      setShifts(normalizedShifts);
      setAssignments(normalizedAssignments);
      setEmployees(normalizedEmployees);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Unable to load shift data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchShifts();
  }, []);

  const createShift = async () => {
    if (!name.trim() || !start_time || !end_time) {
      toast.error("Please fill shift name, start time, and end time");
      return;
    }

    try {
      setIsCreating(true);
      await shiftService.createShift({
        name: name.trim(),
        start_time,
        end_time,
      });
      setName("");
      setStartTime("");
      setEndTime("");
      toast.success("Shift created successfully");
      await fetchShifts();
    } catch (error) {
      console.error("Error creating shift:", error);
      toast.error("Unable to create shift");
    } finally {
      setIsCreating(false);
    }
  };

  const assignShift = async () => {
    if (!employee_id || !shift_id) {
      toast.error("Please select employee and shift");
      return;
    }

    try {
      setIsAssigning(true);

      await shiftService.assignShift({
        employee_id: Number(employee_id),
        shift_id: Number(shift_id),
      });

      setEmployeeId("");
      setShiftId("");
      toast.success("Shift assigned successfully");
      await fetchShifts();
    } catch (error) {
      console.error("Error assigning shift:", error);
      toast.error("Unable to assign shift");
    } finally {
      setIsAssigning(false);
    }
  };

  const onEditShift = () => {
    toast("Edit shift API is not available yet");
  };

  const onDeleteShift = () => {
    toast("Delete shift API is not available yet");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl bg-white p-8 shadow-md">
          <div className="border-b border-slate-200 pb-4 mb-4">
            <h1 className="text-3xl font-bold text-slate-900">Employee Management System</h1>
            <p className="mt-2 text-base text-slate-600">Manage shifts and assign employees efficiently</p>
          </div>
          <h2 className="text-xl font-bold text-blue-600">Shift Management</h2>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-slate-900">Create Shift</h2>
          <p className="mt-1 text-sm text-gray-500">Define shift name and timing.</p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              type="text"
              placeholder="Shift Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
            />

            <input
              type="time"
              title="Shift start time"
              placeholder="Start time"
              value={start_time}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClassName}
            />

            <input
              type="time"
              title="Shift end time"
              placeholder="End time"
              value={end_time}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClassName}
            />

            <button
              onClick={createShift}
              disabled={isCreating}
              className={`${buttonBaseClassName} bg-blue-600 hover:bg-blue-700`}
            >
              <span className="text-base">+</span>
              {isCreating ? "Adding..." : "Add Shift"}
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Shift List</h2>
          </div>

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Loading shifts...</div>
          ) : shifts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              No shifts found. Create your first shift above.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow">
              <table className="min-w-full bg-white">
                <thead className="bg-slate-100 text-left text-sm font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Start Time</th>
                    <th className="px-4 py-3">End Time</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => (
                    <tr key={shift.id} className="border-t border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{shift.name || "--"}</td>
                      <td className="px-4 py-3">{formatShiftTime(shift.start_time)}</td>
                      <td className="px-4 py-3">{formatShiftTime(shift.end_time)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={onEditShift}
                            className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={onDeleteShift}
                            className="h-9 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-slate-900">Assign Shift to Employee</h2>
          <p className="mt-1 text-sm text-gray-500">Map employees with an active shift.</p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              title="Select employee"
              value={employee_id}
              onChange={(e) => setEmployeeId(e.target.value)}
              className={inputClassName}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {getEmployeeName(emp)}
                </option>
              ))}
            </select>

            <select
              title="Select shift"
              value={shift_id}
              onChange={(e) => setShiftId(e.target.value)}
              className={inputClassName}
            >
              <option value="">Select Shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name || "--"}
                </option>
              ))}
            </select>

            <button
              onClick={assignShift}
              disabled={isAssigning}
              className={`${buttonBaseClassName} bg-emerald-600 hover:bg-emerald-700`}
            >
              <span className="text-base">✓</span>
              {isAssigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-slate-900">Assigned Employees</h2>
          <p className="mt-1 text-sm text-gray-500">Overview of employee shift assignments.</p>

          {loading ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              No shift assignments yet.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 shadow">
              <table className="min-w-full bg-white">
                <thead className="bg-slate-100 text-left text-sm font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Shift Name</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((item, index) => {
                    const status = getAssignmentStatus(item);
                    const badgeClass =
                      status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700";

                    return (
                      <tr
                        key={item.id ?? `${item.employee_id || "emp"}-${item.shift_id || "shift"}-${index}`}
                        className="border-t border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-slate-900">{item.employee_name || "--"}</td>
                        <td className="px-4 py-3">{item.shift_name || "--"}</td>
                        <td className="px-4 py-3">
                          {formatShiftTime(item.start_time)} - {formatShiftTime(item.end_time)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

