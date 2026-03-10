"use client";

import { useEffect, useState } from "react";
import attendanceService from "@/services/attendanceService";

type AttendanceReport = {
  id: number | string;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status?: string | null;
  hours_worked?: number | string | null;
};

const normalizeReports = (payload: unknown): AttendanceReport[] => {
  if (Array.isArray(payload)) {
    return payload as AttendanceReport[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "attendance" in payload &&
    Array.isArray(payload.attendance)
  ) {
    return payload.attendance as AttendanceReport[];
  }

  return [];
};

const formatReportDate = (report: AttendanceReport): string => {
  const source = report.check_in ?? report.date;

  if (!source) {
    return "-";
  }

  const parsedDate = new Date(source);

  if (Number.isNaN(parsedDate.getTime())) {
    return report.date || "-";
  }

  return parsedDate.toLocaleDateString();
};

const calculateWorkedHours = (report: AttendanceReport): string => {
  if (!report.check_in || !report.check_out) {
    return "-";
  }

  const checkIn = new Date(report.check_in);
  const checkOut = new Date(report.check_out);

  if (
    Number.isNaN(checkIn.getTime()) ||
    Number.isNaN(checkOut.getTime()) ||
    checkOut.getTime() < checkIn.getTime()
  ) {
    return "-";
  }

  return ((checkOut.getTime() - checkIn.getTime()) / 3600000).toFixed(2);
};

export default function AttendanceReportsPage() {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await attendanceService.getMyAttendance();
      setReports(normalizeReports(data));
    } catch (loadError) {
      console.error(loadError);
      setError("Attendance reports load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[34px] p-7 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">
              Attendance intelligence
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Attendance reports
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              API se apni attendance history load karke recent check-in aur
              check-out activity review karein.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadReports()}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
          >
            Refresh reports
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-teal-200/70 bg-teal-50 p-5 text-teal-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <p className="text-xs uppercase tracking-[0.28em] opacity-70">
            Total records
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight">
            {reports.length}
          </p>
          <p className="mt-2 text-sm leading-6 opacity-80">
            Attendance API se load hone wali entries.
          </p>
        </div>

        <div className="rounded-[28px] border border-amber-200/70 bg-amber-50 p-5 text-amber-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <p className="text-xs uppercase tracking-[0.28em] opacity-70">
            Checked in
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight">
            {reports.filter((report) => report.check_in).length}
          </p>
          <p className="mt-2 text-sm leading-6 opacity-80">
            Entries jahan check-in time available hai.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-slate-50 p-5 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <p className="text-xs uppercase tracking-[0.28em] opacity-70">
            Completed days
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight">
            {reports.filter((report) => report.check_out).length}
          </p>
          <p className="mt-2 text-sm leading-6 opacity-80">
            Entries jahan checkout bhi present hai.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-[34px] p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              Live data
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              My attendance records
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Source: `attendanceService.getMyAttendance()`
          </p>
        </div>

        {loading ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            Attendance reports load ho rahe hain...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            Attendance API ne abhi koi record return nahi kiya.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.26em] text-slate-500">
                  <th className="px-4 pb-1 font-medium">Date</th>
                  <th className="px-4 pb-1 font-medium">Check in</th>
                  <th className="px-4 pb-1 font-medium">Check out</th>
                  <th className="px-4 pb-1 font-medium">Status</th>
                  <th className="px-4 pb-1 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr
                    key={report.id ?? `${report.date}-${index}`}
                    className="soft-panel"
                  >
                    <td className="rounded-l-[22px] px-4 py-4 text-sm font-semibold text-slate-900">
                      {formatReportDate(report)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {report.check_in ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {report.check_out ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {report.status ?? "-"}
                    </td>
                    <td className="rounded-r-[22px] px-4 py-4 text-sm text-slate-600">
                      {calculateWorkedHours(report)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
