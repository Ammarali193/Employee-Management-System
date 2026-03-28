"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../services/api";

type DashboardSummary = {
  employees: number;
  attendance: number;
  leaves: number;
  payroll: number;
};

type AttendancePoint = {
  label: string;
  value: number;
};

type PayrollPoint = {
  label: string;
  value: number;
};

type MetricCard = {
  key: keyof DashboardSummary;
  title: string;
  icon: string;
};

const defaultMetricCards: MetricCard[] = [
  { key: "employees", title: "Employees", icon: "👤" },
  { key: "attendance", title: "Attendance", icon: "🕒" },
  { key: "leaves", title: "Leaves", icon: "📄" },
  { key: "payroll", title: "Payroll", icon: "💰" },
];

const hrMetricCards: MetricCard[] = [
  { key: "employees", title: "Total Employees", icon: "👥" },
  { key: "leaves", title: "Pending Leaves", icon: "📝" },
  { key: "attendance", title: "Today Attendance", icon: "📅" },
];

const operationsMetricCards: MetricCard[] = [
  { key: "employees", title: "Employees", icon: "👤" },
  { key: "attendance", title: "Attendance", icon: "🕒" },
  { key: "leaves", title: "Leaves", icon: "📄" },
];

const unwrapArray = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as Record<string, unknown>[];
    if (Array.isArray(record.items)) return record.items as Record<string, unknown>[];
  }
  return [];
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-2xl bg-white shadow-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-lg" />
        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-lg" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>({
    employees: 0,
    attendance: 0,
    leaves: 0,
    payroll: 0,
  });
  const [role, setRole] = useState("employee");
  const [attendanceTrend, setAttendanceTrend] = useState<AttendancePoint[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<PayrollPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const isHr = role === "hr";
  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const canViewPayroll = isAdmin || isHr;
  const showAdvancedAnalytics = canViewPayroll && !isHr;

  useEffect(() => {
    const storedRole = String(localStorage.getItem("role") || "employee").toLowerCase();
    setRole(storedRole);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isHr) {
        const [employeesRes, leavesRes, attendanceRes] = await Promise.all([
          api.get("/employees"),
          api.get("/leaves"),
          api.get("/attendance"),
        ]);

        const employees = unwrapArray(employeesRes.data);
        const leaves = unwrapArray(leavesRes.data);
        const attendance = unwrapArray(attendanceRes.data);
        const todayIso = new Date().toISOString().slice(0, 10);
        const presentToday = attendance.filter((row) => {
          const checkInValue = String(row.check_in ?? row.date ?? "").slice(0, 10);
          if (checkInValue !== todayIso) return false;

          const status = String(row.status ?? "").toLowerCase();
          return !status || status === "present";
        }).length;

        setSummary({
          employees: employees.length,
          attendance: presentToday,
          leaves: leaves.filter((row) => String(row.status ?? "").toLowerCase() === "pending").length,
          payroll: 0,
        });
        setAttendanceTrend([]);
        setPayrollSummary([]);
        return;
      }

      if (isManager) {
        const [employeesRes, attendanceRes, leaveRes] = await Promise.all([
          api.get("/employees"),
          api.get("/attendance/stats"),
          api.get("/leave/all"),
        ]);

        const employees = unwrapArray(employeesRes.data);
        const leaves = unwrapArray(leaveRes.data);

        setSummary({
          employees: employees.length,
          attendance:
            typeof attendanceRes.data?.present === "number" ? attendanceRes.data.present : 0,
          leaves: leaves.filter((row) => String(row.status ?? "").toLowerCase() === "pending").length,
          payroll: 0,
        });

        setAttendanceTrend([]);
        setPayrollSummary([]);
        return;
      }

      if (!isAdmin) {
        const [attendanceRes, leaveRes] = await Promise.all([
          api.get("/attendance/stats"),
          api.get("/leave/all"),
        ]);

        const leaves = unwrapArray(leaveRes.data);

        setSummary({
          employees: 0,
          attendance:
            typeof attendanceRes.data?.present === "number" ? attendanceRes.data.present : 0,
          leaves: leaves.filter((row) => String(row.status ?? "").toLowerCase() === "pending").length,
          payroll: 0,
        });

        setAttendanceTrend([]);
        setPayrollSummary([]);
        return;
      }

      const [employeesRes, attendanceRes, leaveRes, payrollRes, attendanceReportRes, payrollReportRes] =
        await Promise.all([
          api.get("/employees"),
          api.get("/attendance/stats"),
          api.get("/leave/all"),
          api.get("/payroll"),
          api.get("/attendance/reports"),
          api.get("/reports/payroll"),
        ]);

      const employees = unwrapArray(employeesRes.data);
      const leaves = unwrapArray(leaveRes.data);
      const payroll = unwrapArray(payrollRes.data);
      const attendanceReport = unwrapArray(attendanceReportRes.data);
      const payrollReport = unwrapArray(payrollReportRes.data);

      setSummary({
        employees: employees.length,
        attendance:
          typeof attendanceRes.data?.present === "number" ? attendanceRes.data.present : 0,
        leaves: leaves.filter((row) => String(row.status ?? "").toLowerCase() === "pending").length,
        payroll: payroll.length,
      });

      const attendanceMap: Record<string, number> = {};
      attendanceReport.forEach((row) => {
        const date = String(row.date ?? row.attendance_date ?? "");
        if (!date) return;
        const key = date.slice(5, 10);
        attendanceMap[key] = (attendanceMap[key] ?? 0) + 1;
      });
      setAttendanceTrend(
        Object.entries(attendanceMap)
          .slice(-7)
          .map(([label, value]) => ({ label, value })),
      );

      const payrollMap: Record<string, number> = {};
      payrollReport.forEach((row) => {
        const month = String(row.month ?? "");
        const year = String(row.year ?? "");
        const key = `${month}-${year}`;
        payrollMap[key] = (payrollMap[key] ?? 0) + Number(row.net_salary ?? 0);
      });
      setPayrollSummary(
        Object.entries(payrollMap)
          .slice(-6)
          .map(([label, value]) => ({ label, value })),
      );
    } catch (error) {
      console.error("[dashboard] load failed", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isHr, isManager]);

  useEffect(() => {
    void load();
  }, [load]);

  const metricCards = isHr
    ? hrMetricCards
    : canViewPayroll
      ? defaultMetricCards
      : operationsMetricCards;

  const maxPayroll = useMemo(
    () => Math.max(...payrollSummary.map((point) => point.value), 1),
    [payrollSummary],
  );

  const payrollTotal = useMemo(
    () => payrollSummary.reduce((sum, point) => sum + point.value, 0),
    [payrollSummary],
  );

  const payrollCompletion = useMemo(() => {
    if (!payrollSummary.length || !maxPayroll) return 0;
    const latest = payrollSummary[payrollSummary.length - 1]?.value ?? 0;
    return Math.max(0, Math.min(100, Math.round((latest / maxPayroll) * 100)));
  }, [payrollSummary, maxPayroll]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <section className="fade-in-up rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isHr ? "HR Dashboard" : isManager ? "Manager Dashboard" : isAdmin ? "Admin Dashboard" : "Employee Dashboard"}
            </h2>
            <p className="text-gray-500">
              {isHr
                ? "Track total employees, pending leave decisions, and today's attendance at a glance."
                : isManager
                  ? "Monitor employees, attendance, and leave queues for your team."
                  : isAdmin
                    ? "Overview of your workforce, attendance, leave, and payroll performance."
                    : "Your attendance and leave snapshot."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <article
            key={card.key}
            className="fade-in-up rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              {card.icon}
            </div>
            <p className="mt-4 text-sm text-gray-500">{card.title}</p>
            <p className="text-3xl font-semibold text-gray-800">{summary[card.key].toLocaleString()}</p>
          </article>
        ))}
      </section>

      {showAdvancedAnalytics ? (
      <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="fade-in-up rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Trend</h3>
            <p className="text-sm text-gray-500">Last 7 periods of attendance activity</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(59,130,246,0.08)" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {attendanceTrend.map((entry, index) => (
                    <Cell key={`${entry.label}-${index}`} fill="#2563eb" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="fade-in-up rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Payroll Distribution</h3>
            <p className="text-sm text-gray-500">Monthly net salary totals</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollSummary}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `Rs ${Number(value ?? 0).toLocaleString()}`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="fade-in-up rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Payroll Target Progress</h3>
            <p className="text-sm text-gray-500">Latest period completion against max month total</p>
          </div>
          <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
            Rs {payrollTotal.toLocaleString()} total
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Completion</span>
            <span className="font-semibold text-green-500">{payrollCompletion}%</span>
          </div>
          <progress
            className="h-3 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-green-500"
            value={payrollCompletion}
            max={100}
          />
        </div>
      </section>
      </div>
      ) : (
      <section className="fade-in-up rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {isHr ? "HR Focus" : isManager ? "Manager Focus" : "Workforce Snapshot"}
            </h3>
            <p className="text-sm text-gray-500">
              {isHr
                ? "Employee operations, leave decisions, and attendance oversight."
                : isManager
                  ? "Team monitoring with attendance and leave visibility."
                  : "Track your attendance and leave activity without payroll access."}
            </p>
          </div>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            {isHr ? "Core HR modules only" : isManager ? "No payroll analytics" : "Limited employee scope"}
          </span>
        </div>
      </section>
      )}
    </div>
  );
}
