import type { ReactNode } from "react";

type EnterpriseCardProps = {
  title: string;
  subtitle?: string;
  value?: string | number;
  children?: ReactNode;
  actions?: ReactNode;
};

export function EnterpriseCard({
  title,
  subtitle,
  value,
  children,
  actions,
}: EnterpriseCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
          {value !== undefined ? <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p> : null}
        </div>
        {actions}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
