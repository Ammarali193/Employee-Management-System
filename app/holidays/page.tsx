"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import advancedService from "@/services/advancedService";

type HolidayRow = {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
};

const formatHolidayDate = (value?: string) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const calculateDurationDays = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = end.getTime() - start.getTime();
  if (diffInMs < 0) return 0;

  return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
};

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await advancedService.getHolidays();
      const rows = Array.isArray(data)
        ? data
        : Array.isArray((data as { holidays?: HolidayRow[] } | null)?.holidays)
          ? ((data as { holidays?: HolidayRow[] }).holidays || [])
          : [];

      setHolidays(rows);
    } catch (error) {
      console.error("[holidays] load failed", error);
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createHoliday = async () => {
    if (!name.trim() || !startDate || !endDate) {
      toast.error("Holiday name, start date and end date are required");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date must be greater than or equal to start date");
      return;
    }

    setCreating(true);
    try {
      await advancedService.createHoliday({
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
      });

      setName("");
      setStartDate("");
      setEndDate("");
      toast.success("Holiday added");
      await load();
    } catch (error) {
      console.error("[holidays] create failed", error);
      toast.error("Failed to add holiday");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Holidays</h1>
        <p className="mt-1 text-sm text-slate-500">Manage company holidays and calendar events.</p>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 lg:max-w-xs">
            <label htmlFor="holiday-name" className="mb-1 block text-sm font-medium text-slate-600">
              Holiday Name
            </label>
            <input
              id="holiday-name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter holiday name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="w-full lg:w-56">
            <label htmlFor="holiday-start-date" className="mb-1 block text-sm font-medium text-slate-600">
              Start Date
            </label>
            <input
              id="holiday-start-date"
              title="Select start date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="w-full lg:w-56">
            <label htmlFor="holiday-end-date" className="mb-1 block text-sm font-medium text-slate-600">
              End Date
            </label>
            <input
              id="holiday-end-date"
              title="Select end date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            onClick={createHoliday}
            disabled={creating}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {creating ? "Adding..." : "Add Holiday"}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Holiday Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && holidays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    No holidays added yet
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading holidays...
                  </td>
                </tr>
              ) : null}

              {!loading
                ? holidays.map((h) => (
                    <tr key={h.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{h.name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatHolidayDate(h.start_date)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatHolidayDate(h.end_date)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {(() => {
                          const durationDays = calculateDurationDays(h.start_date, h.end_date);
                          const isSingleDay = durationDays <= 1;

                          return (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isSingleDay
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {durationDays || 1} {durationDays === 1 ? "Day" : "Days"}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
