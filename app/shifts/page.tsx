"use client";

import { useEffect, useState } from "react";

type Shift = {
  id: number | string;
  name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
};

const SHIFT_TIMINGS: Record<string, { start: string; end: string }> = {
  "Morning Shift": { start: "09:00", end: "17:00" },
  "Evening Shift": { start: "14:00", end: "22:00" },
  "Mid Shift": { start: "22:00", end: "06:00" },
};

const formatShiftTime = (time?: string | null) => {
  if (!time) return "-";

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;

    return new Date(`1970-01-01T${normalizedTime}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const parsedTime = new Date(time);

  if (Number.isNaN(parsedTime.getTime())) {
    return time;
  }

  return parsedTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, setName] = useState("");
  const [start_time, setStartTime] = useState("");
  const [end_time, setEndTime] = useState("");
  const [editingShiftId, setEditingShiftId] = useState<number | string | null>(
    null,
  );

  const getInputTimeValue = (time?: string | null) => {
    if (!time) return "";

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      return time.slice(0, 5);
    }

    const parsedTime = new Date(time);

    if (Number.isNaN(parsedTime.getTime())) {
      return "";
    }

    return parsedTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const resetForm = () => {
    setName("");
    setStartTime("");
    setEndTime("");
    setEditingShiftId(null);
  };

  const handleShiftChange = (value: string) => {
    const timing = SHIFT_TIMINGS[value];

    if (timing) {
      setStartTime(timing.start);
      setEndTime(timing.end);
    }

    setName(value);
  };

  const fetchShifts = async () => {
    const res = await fetch("http://localhost:5000/api/shifts");
    const data = await res.json();

    setShifts(Array.isArray(data) ? data : []);
  };

  const isFormComplete = Boolean(name && start_time && end_time);

  useEffect(() => {
    void fetchShifts();
  }, []);

  const deleteShift = async (id: number | string) => {
    await fetch(`http://localhost:5000/api/shifts/${id}`, {
      method: "DELETE",
    });

    fetchShifts();
  };

  const createShift = async () => {
    await fetch("http://localhost:5000/api/shifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        start_time,
        end_time,
      }),
    });

    resetForm();
    fetchShifts();
  };

  const updateShift = async (
    id: number | string,
    data: {
      name: string;
      start_time: string;
      end_time: string;
    },
  ) => {
    await fetch(`http://localhost:5000/api/shifts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    resetForm();
    fetchShifts();
  };

  const handleEdit = async (shift: Shift) => {
    setEditingShiftId(shift.id);
    setName(shift.name ?? "");
    setStartTime(getInputTimeValue(shift.start_time));
    setEndTime(getInputTimeValue(shift.end_time));
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Shifts</h1>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-5 shadow">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Shift Name
            <select
              id="shiftType"
              value={name}
              onChange={(e) => handleShiftChange(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            >
              <option value="">Select Shift</option>
              {name && !(name in SHIFT_TIMINGS) ? (
                <option value={name}>{name}</option>
              ) : null}
              <option value="Morning Shift">Morning Shift</option>
              <option value="Evening Shift">Evening Shift</option>
              <option value="Mid Shift">Mid Shift</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Start Time
            <input
              type="time"
              value={start_time}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            End Time
            <input
              type="time"
              value={end_time}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => void createShift()}
            disabled={!isFormComplete}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Create Shift
          </button>

          {editingShiftId !== null ? (
            <>
              <button
                onClick={() =>
                  void updateShift(editingShiftId, {
                    name,
                    start_time,
                    end_time,
                  })
                }
                disabled={!isFormComplete}
                className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Update Shift
              </button>

              <button
                onClick={resetForm}
                className="rounded-lg bg-gray-500 px-4 py-2 text-white"
              >
                Cancel
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-center">Start</th>
              <th className="p-2 text-center">End</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id} className="border-t">
                <td className="p-2">{shift.name ?? "-"}</td>
                <td className="p-2 text-center">
                  {formatShiftTime(shift.start_time)}
                </td>
                <td className="p-2 text-center">
                  {formatShiftTime(shift.end_time)}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleEdit(shift)}
                    className="bg-yellow-500 px-2 py-1 text-white rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteShift(shift.id)}
                    className="bg-red-500 px-2 py-1 text-white rounded ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
