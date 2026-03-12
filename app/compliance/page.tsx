type ComplianceStats = {
  total?: string | number;
  pending?: string | number;
  completed?: string | number;
};

type ComplianceReport = {
  id: number | string;
  title?: string | null;
  category?: string | null;
  status?: string | null;
};

type ComplianceReportsResponse = {
  report?: ComplianceReport[];
};

export const dynamic = "force-dynamic";

async function getStats(): Promise<ComplianceStats> {
  try {
    const res = await fetch("http://localhost:5000/api/compliance/stats", {
      cache: "no-store",
    });

    if (!res.ok) {
      return {};
    }

    return (await res.json()) as ComplianceStats;
  } catch (error) {
    console.error("Compliance stats fetch failed", error);
    return {};
  }
}

async function getReports(): Promise<ComplianceReportsResponse> {
  try {
    const res = await fetch("http://localhost:5000/api/reports", {
      cache: "no-store",
    });

    if (!res.ok) {
      return { report: [] };
    }

    return (await res.json()) as ComplianceReportsResponse;
  } catch (error) {
    console.error("Compliance reports fetch failed", error);
    return { report: [] };
  }
}

export default async function CompliancePage() {
  const stats = await getStats();
  const reportsData = await getReports();
  const reports = reportsData.report || [];

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-sm text-gray-500">Live Workload</p>
          <h2 className="text-3xl font-bold mt-2">{stats.total}</h2>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
          <p className="text-sm text-gray-500">Service Level</p>
          <h2 className="text-3xl font-bold mt-2 text-indigo-700">
            {stats.pending}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="text-sm text-gray-500">Exceptions</p>
          <h2 className="text-3xl font-bold mt-2">{stats.completed}</h2>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>

        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="py-3">Title</th>
              <th className="py-3">Category</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {reports?.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="py-4 font-medium">{report.title}</td>

                <td className="py-4 text-gray-600">{report.category}</td>

                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
