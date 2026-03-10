"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-5">
      <h2 className="text-2xl font-bold mb-8">EMS</h2>

      <ul className="space-y-4">
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link href="/employees">Employees</Link>
        </li>

        <li>
          <Link href="/attendance">Attendance</Link>
        </li>

        <li>
          <Link href="/leave">Leave</Link>
        </li>

        <li>
          <Link href="/assets">Assets</Link>
        </li>

        <li>
          <Link href="/payroll">Payroll List</Link>
        </li>

        <li>
          <Link href="/payroll/assign">Assign Salary</Link>
        </li>

        <li>
          <Link
            href="/payroll/payslip"
            className="flex items-center gap-2"
          >
            💳 Payslip
          </Link>
        </li>

        <li>
          <Link href="/payroll/report">Payroll Report</Link>
        </li>

        <li>
          <Link href="/performance">Performance</Link>
        </li>

        <li>
          <Link href="/compliance">Compliance</Link>
        </li>

        <li>
          <Link href="/lifecycle">Lifecycle</Link>
        </li>
      </ul>
    </div>
  );
}
