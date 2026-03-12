import Link from "next/link";
import {
  getWorkspacePage,
  type PageMetric,
  type PageId,
  type Tone,
} from "@/components/layout/workspace-config";

type ModulePageProps = {
  pageId: PageId;
  employeeId?: string;
  metricsOverride?: PageMetric[];
};

const toneClasses: Record<Tone, string> = {
  teal: "border-teal-200/70 bg-teal-50 text-teal-900",
  amber: "border-amber-200/70 bg-amber-50 text-amber-900",
  slate: "border-slate-200/80 bg-slate-50 text-slate-900",
};

export function ModulePage({
  pageId,
  employeeId,
  metricsOverride,
}: ModulePageProps) {
  const page = getWorkspacePage(pageId, employeeId);
  const metrics = metricsOverride ?? page.metrics;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="glass-panel relative overflow-hidden rounded-[34px] p-7 sm:p-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[rgba(15,118,110,0.1)] blur-3xl" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">
              {page.eyebrow}
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.35rem]">
              {page.title}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {page.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {page.actions.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    index === 0
                      ? "bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] hover:bg-slate-800"
                      : "border border-slate-200 bg-white/90 text-slate-900 hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
            Focus today
          </p>
          <div className="mt-5 space-y-4">
            {page.focus.map((item, index) => (
              <div
                key={item}
                className="flex gap-3 rounded-[22px] border border-white/70 bg-white/65 p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-bold tracking-[0.2em] text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((item) => (
          <div
            key={item.label}
            className={`rounded-[28px] border p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${toneClasses[item.tone]}`}
          >
            <p className="text-xs uppercase tracking-[0.28em] opacity-70">
              {item.label}
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-2 text-sm leading-6 opacity-80">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="glass-panel rounded-[34px] p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                Operating queue
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Current workload snapshot
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              Keep ownership, status, and target clear for every action item.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.26em] text-slate-500">
                  <th className="px-4 pb-1 font-medium">Queue</th>
                  <th className="px-4 pb-1 font-medium">Owner</th>
                  <th className="px-4 pb-1 font-medium">Status</th>
                  <th className="px-4 pb-1 font-medium">Target</th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((item) => (
                  <tr key={`${item.subject}-${item.owner}`} className="soft-panel">
                    <td className="rounded-l-[22px] px-4 py-4 text-sm font-semibold text-slate-900">
                      {item.subject}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{item.owner}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{item.status}</td>
                    <td className="rounded-r-[22px] px-4 py-4 text-sm text-slate-600">
                      {item.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[34px] p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              Signals
            </p>
            <div className="mt-5 space-y-4">
              {page.signals.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/70 bg-white/68 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                      {item.value}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel ambient-grid overflow-hidden rounded-[34px] p-6">
            <div className="rounded-[24px] bg-white/78 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                Recommended rhythm
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <p>Morning: clear blocking approvals before teams switch focus.</p>
                <p>Midday: reconcile exceptions with attendance, payroll, or asset owners.</p>
                <p>End of day: export unresolved items and assign a clear next action.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
