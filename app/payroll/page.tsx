// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { toast } from "react-hot-toast";
// import payrollService from "@/services/payrollService";
// import employeeService from "@/services/employeeService";

// type PayrollRecord = {
//   id: number;
//   employee_id: number;
//   basic_salary: number;
//   allowance?: number;
//   deduction?: number;
//   net_salary: number;
//   month: string;
// };

// type Employee = {
//   id: number;
//   first_name: string;
//   last_name: string;
// };

// export default function PayrollPage() {
//   const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   const filteredRecords = useMemo(() => {
//     return payrollRecords.filter((record) => {
//       const employee = employees.find((e) => e.id === record.employee_id);
//       const employeeName =
//         `${employee?.first_name || ""} ${employee?.last_name || ""}`.toLowerCase();

//       const monthMatch =
//         !selectedMonth || record.month.includes(selectedMonth);
//       const searchMatch =
//         !search || employeeName.includes(search.toLowerCase());

//       return monthMatch && searchMatch;
//     });
//   }, [payrollRecords, employees, search, selectedMonth]);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [payrollData, employeesData] = await Promise.all([
//           payrollService.getPayroll(),
//           employeeService.getEmployees(),
//         ]);

//         setPayrollRecords(Array.isArray(payrollData) ? payrollData : []);
//         setEmployees(Array.isArray(employeesData) ? employeesData : []);
//       } catch (error) {
//         console.error("Failed to load data:", error);
//         toast.error("Failed to load payroll records");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const getEmployeeName = (employeeId: number) => {
//     const employee = employees.find((e) => e.id === employeeId);
//     return employee
//       ? `${employee.first_name} ${employee.last_name}`
//       : `Employee #${employeeId}`;
//   };

//   const totalBasicSalary = filteredRecords.reduce(
//     (sum, r) => sum + r.basic_salary,
//     0
//   );
//   const totalNetSalary = filteredRecords.reduce(
//     (sum, r) => sum + r.net_salary,
//     0
//   );

//   if (loading) {
//     return <div className="p-10">Loading payroll records...</div>;
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6 flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Payroll Management</h1>
//         <div className="space-x-2">
//           <Link
//             href="/payroll/assign"
//             className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
//           >
//             Assign Salary
//           </Link>
//           <Link
//             href="/payroll/payslip"
//             className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
//           >
//             View Payslip
//           </Link>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="mb-6 grid gap-4 md:grid-cols-2">
//         <input
//           type="text"
//           placeholder="Search by employee name..."
//           className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <div>
//           <label htmlFor="month-filter" className="sr-only">
//             Filter by month
//           </label>
//           <input
//             id="month-filter"
//             type="month"
//             title="Filter by month"
//             className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Summary Cards */}
// <div className="mb-6 grid gap-4 md:grid-cols-2">
//   <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
//     <p className="text-sm text-slate-600">Total Basic Salary</p>
//     <p className="text-2xl font-bold text-blue-600">
//       ₨{(totalBasicSalary || 0).toLocaleString()}
//     </p>
//   </div>

//   <div className="rounded-lg bg-green-50 p-4 border border-green-200">
//     <p className="text-sm text-slate-600">Total Net Salary</p>
//     <p className="text-2xl font-bold text-green-600">
//       ₨{(totalNetSalary || 0).toLocaleString()}
//     </p>
//   </div>
// </div>

//       {/* Payroll Table */}
//       {filteredRecords.length === 0 ? (
//         <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-600">
//           {payrollRecords.length === 0
//             ? "No payroll records found. Assign a salary to get started!"
//             : "No payroll records match your search."}
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-lg shadow">
//           <table className="w-full bg-white">
//             <thead>
//               <tr className="border-b bg-slate-50">
//                 <th className="p-3 text-left text-sm font-semibold text-slate-900">
//                   Employee
//                 </th>
//                 <th className="p-3 text-right text-sm font-semibold text-slate-900">
//                   Basic Salary
//                 </th>
//                 <th className="p-3 text-right text-sm font-semibold text-slate-900">
//                   Allowance
//                 </th>
//                 <th className="p-3 text-right text-sm font-semibold text-slate-900">
//                   Deduction
//                 </th>
//                 <th className="p-3 text-right text-sm font-semibold text-slate-900">
//                   Net Salary
//                 </th>
//                 <th className="p-3 text-left text-sm font-semibold text-slate-900">
//                   Month
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredRecords.map((record) => (
//                 <tr key={record.id || `payroll-${record.employee_id}-${record.month}`} className="border-b transition-colors hover:bg-slate-50"
//                   >
//                   <td className="p-3 text-sm font-medium text-slate-900">
//                     {getEmployeeName(record.employee_id)}
//                   </td>
//                   <td className="p-3 text-right text-sm text-slate-700">
//                     ₨{(record.basic_salary || 0).toLocaleString()}
//                   </td>
//                   <td className="p-3 text-right text-sm text-green-600">
//                     +₨{(record.allowance || 0).toLocaleString()}
//                   </td>
//                   <td className="p-3 text-right text-sm text-red-600">
//                     -₨{(record.deduction || 0).toLocaleString()}
//                   </td>
//                   <td className="p-3 text-right text-sm font-semibold text-slate-900">
//                     <span className="rounded-lg bg-green-100 px-2 py-1 text-green-700">
//                       ₨{(record.net_salary || 0).toLocaleString()}
//                     </span>
//                   </td>
//                   <td className="p-3 text-sm text-slate-600">{record.month}</td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot>
//               <tr className="border-t-2 bg-slate-50">
//                 <td className="p-3 text-sm font-bold text-slate-900">TOTAL</td>
//                 <td className="p-3 text-right text-sm font-bold text-slate-900">
//                   ₨{(totalBasicSalary || 0).toLocaleString()}
//                 </td>
//                 <td className="p-3 text-right text-sm font-bold text-green-600">
//                   ₨
//                   {(filteredRecords.reduce((sum, r) => sum + (r.allowance || 0), 0) || 0).toLocaleString()}
//                 </td>
//                 <td className="p-3 text-right text-sm font-bold text-red-600">
//                   ₨{(filteredRecords.reduce((sum, r) => sum + (r.deduction || 0), 0) || 0).toLocaleString()}
//                 </td>
//                 <td className="p-3 text-right text-sm font-bold text-green-600">
//                  ₨{(totalNetSalary || 0).toLocaleString()}
//                 </td>
//                 <td />
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       )}

//       {/* Summary Info */}
//       <div className="mt-8 rounded-lg bg-slate-50 p-4">
//         <h3 className="mb-3 font-semibold text-slate-900">Payroll Summary:</h3>
//         <div className="grid gap-3 md:grid-cols-3 text-sm">
//           <div>
//             <span className="text-slate-600">Total Records:</span>
//             <p className="font-bold text-slate-900">{filteredRecords.length}</p>
//           </div>
//           <div>
//             <span className="text-slate-600">Total Basic Salary:</span>
//             <p className="font-bold text-slate-900">
//               ₨{(totalBasicSalary || 0).toLocaleString()}
//             </p>
//           </div>
//           <div>
//             <span className="text-slate-600">Total Net Payable:</span>
//             <p className="font-bold text-green-600">
//               ₨{(totalNetSalary || 0).toLocaleString()}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import payrollService from "@/services/payrollService";
import employeeService from "@/services/employeeService";

type PayrollRecord = {
  id: number;
  employee_id: number;
  basic_salary: number;
  allowance?: number;
  deduction?: number;
  net_salary: number;
  month: string;
};

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
};

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const filteredRecords = useMemo(() => {
    return payrollRecords.filter((record) => {
      const employee = employees.find((e) => e.id === record.employee_id);
      const employeeName =
        `${employee?.first_name || ""} ${employee?.last_name || ""}`.toLowerCase();

      const monthMatch =
        !selectedMonth || record.month.includes(selectedMonth);
      const searchMatch =
        !search || employeeName.includes(search.toLowerCase());

      return monthMatch && searchMatch;
    });
  }, [payrollRecords, employees, search, selectedMonth]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [payrollData, employeesData] = await Promise.all([
          payrollService.getPayroll(),
          employeeService.getEmployees(),
        ]);

        setPayrollRecords(Array.isArray(payrollData) ? payrollData : []);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load payroll records");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : `Employee #${employeeId}`;
  };

  const totalBasicSalary = filteredRecords.reduce(
    (sum, r) => sum + r.basic_salary,
    0
  );
  const totalNetSalary = filteredRecords.reduce(
    (sum, r) => sum + r.net_salary,
    0
  );

  if (loading) {
    return <div className="p-10">Loading payroll records...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        <div className="space-x-2">
          <Link
            href="/payroll/assign"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Assign Salary
          </Link>
          <Link
            href="/payroll/payslip"
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            View Payslip
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Search by employee name..."
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="month"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full bg-white">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-right">Basic</th>
              <th className="p-3 text-right">Allowance</th>
              <th className="p-3 text-right">Deduction</th>
              <th className="p-3 text-right">Net</th>
              <th className="p-3 text-left">Month</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.map((record) => (
              <tr
                key={record.id || `payroll-${record.employee_id}-${record.month}`}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-3">
                  {record.first_name} {record.last_name}
                </td>
                <td className="p-3 text-right">
                  ₨{record.basic_salary}
                </td>
                <td className="p-3 text-right text-green-600">
                  ₨{record.allowance || 0}
                </td>
                <td className="p-3 text-right text-red-600">
                  ₨{record.deduction || 0}
                </td>
                <td className="p-3 text-right font-bold">
                  ₨{record.net_salary}
                </td>
                <td className="p-3">{record.month}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}