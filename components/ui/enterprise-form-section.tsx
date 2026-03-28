"use client";

import type { FormEventHandler, ReactNode } from "react";

type EnterpriseFormSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export function EnterpriseFormSection({
  title,
  description,
  actions,
  children,
  onSubmit,
}: EnterpriseFormSectionProps) {
  const content = (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </>
  );

  if (onSubmit) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          {content}
        </form>
      </section>
    );
  }

  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{content}</section>;
}
