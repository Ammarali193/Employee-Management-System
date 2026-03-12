type Employee = {
  id: number | string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  department?: string | null;
  salary?: string | number | null;
};

async function getEmployees(): Promise<Employee[]> {
  try {
    const res = await fetch("http://localhost:5000/api/employees", {
      cache: "no-store",
    });

    const data = (await res.json()) as Employee[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Employees fetch failed", error);
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="p-6">
      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Employees</h2>

          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
            Add Employee
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="py-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Department</th>
              <th className="py-3">Salary</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {employees?.map((emp) => {
              const fullName =
                `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() || "-";

              return (
                <tr key={emp.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 font-medium text-gray-800">
                    {emp.name ?? fullName}
                  </td>

                  <td className="py-4 text-gray-600">{emp.email ?? "-"}</td>

                  <td className="py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {emp.department || "N/A"}
                    </span>
                  </td>

                  <td className="py-4 font-semibold text-gray-700">
                    {emp.salary ? `PKR ${emp.salary}` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
