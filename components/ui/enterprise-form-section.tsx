import type { FormEventHandler, ReactNode } from "react";

type EnterpriseFormSectionProps = {
  title: string;
  description?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  actions?: ReactNode;
};

export function EnterpriseFormSection({
  title,
  description,
  onSubmit,
  children,
  actions,
}: EnterpriseFormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        {children}
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </form>
    </section>
  );
}
