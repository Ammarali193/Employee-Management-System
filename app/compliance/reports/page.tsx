type ComplianceReport = {
  id: number | string;
  title: string;
  category: string;
  description?: string | null;
  created_at?: string | null;
};

type ComplianceReportsResponse = {
  report?: ComplianceReport[];
};

export const dynamic = "force-dynamic";

async function getReports(): Promise<ComplianceReportsResponse> {
  try {
    const res = await fetch("http://localhost:5000/api/compliance/report", {
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

export default async function ComplianceReportsPage() {
  const data = await getReports();
  const reports = Array.isArray(data.report) ? data.report : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Compliance Reports</h1>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Title</th>
            <th className="p-2">Category</th>
            <th className="p-2">Description</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>

        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center">
                No compliance data
              </td>
            </tr>
          ) : (
            reports.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.title}</td>
                <td className="p-2">{r.category}</td>
                <td className="p-2">{r.description ?? "-"}</td>
                <td className="p-2">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
