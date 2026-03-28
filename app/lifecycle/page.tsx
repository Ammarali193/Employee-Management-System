import Link from "next/link";

const modules = [
  {
    title: "Jobs",
    description: "Create and track open positions.",
    href: "/lifecycle/jobs",
  },
  {
    title: "Candidates",
    description: "Manage candidate pipeline and status.",
    href: "/lifecycle/candidates",
  },
  {
    title: "Onboarding",
    description: "Run onboarding checklists and plans.",
    href: "/lifecycle/onboarding",
  },
  {
    title: "Exit",
    description: "Capture exit details and handover notes.",
    href: "/lifecycle/exit",
  },
];

export default function LifecyclePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Lifecycle Management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage the entire employee lifecycle from hiring to exit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <article
            key={module.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
            <Link
              href={module.href}
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Open {module.title}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
