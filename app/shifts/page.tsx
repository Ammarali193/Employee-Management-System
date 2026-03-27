 "use client";

import { useEffect, useState } from "react";
import shiftService from "@/services/shiftService";

type Shift = {
  id: number | string;
  name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
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

  return time;
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, setName] = useState("");
  const [start_time, setStartTime] = useState("");
  const [end_time, setEndTime] = useState("");

  const fetchShifts = async () => {
    try {
      const data = await shiftService.getShifts();
      setShifts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const createShift = async () => {
    try {
      await shiftService.createShift({
        name,
        start_time,
        end_time,
      });
      setName("");
      setStartTime("");
      setEndTime("");
      fetchShifts();
    } catch (error) {
      console.error("Error creating shift:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Shifts</h1>

      <div className="my-4">
        <input
          type="text"
          placeholder="Shift Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mr-2"
        />

        <input
          type="time"
          value={start_time}
          onChange={(e) => setStartTime(e.target.value)}
          className="border p-2 mr-2"
        />

        <input
          type="time"
          value={end_time}
          onChange={(e) => setEndTime(e.target.value)}
          className="border p-2 mr-2"
        />

        <button
          onClick={createShift}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Add
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>

        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.name}</td>
              <td>{formatShiftTime(shift.start_time)}</td>
              <td>{formatShiftTime(shift.end_time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

