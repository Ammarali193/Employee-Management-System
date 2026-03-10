"use client";

import Link from "next/link";
import { navigationSections } from "@/components/layout/workspace-config";

type SidebarProps = {
  activeHref: string;
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ activeHref, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/45 transition duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[304px] transform border-r border-white/55 bg-[linear-gradient(180deg,#0f172a_0%,#14334f_100%)] text-white shadow-[0_30px_90px_rgba(15,23,42,0.28)] transition duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
          <div className="rounded-[28px] border border-white/15 bg-white/8 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2dd4bf_0%,#f59e0b_100%)] text-sm font-bold text-slate-950">
                  NS
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-teal-100/80">
                    Workforce OS
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    Northstar EMS
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75 transition hover:text-white lg:hidden"
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                  Live units
                </p>
                <p className="mt-2 text-2xl font-semibold">18</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                  Pending actions
                </p>
                <p className="mt-2 text-2xl font-semibold">37</p>
              </div>
            </div>
          </div>

          <nav className="space-y-5">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <p className="px-2 text-[11px] uppercase tracking-[0.32em] text-white/45">
                  {section.title}
                </p>
                <div className="mt-3 space-y-1.5">
                  {section.items.map((item) => {
                    const isActive = item.href === activeHref;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-start gap-3 rounded-[22px] px-3 py-3 transition ${
                          isActive
                            ? "bg-white text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                            : "hover:bg-white/8"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold tracking-[0.22em] ${
                            isActive
                              ? "bg-[linear-gradient(135deg,#ccfbf1_0%,#fef3c7_100%)] text-slate-950"
                              : "border border-white/15 bg-white/6 text-white/75"
                          }`}
                        >
                          {item.cue}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold tracking-tight">
                            {item.label}
                          </span>
                          <span
                            className={`mt-1 block text-xs leading-5 ${
                              isActive ? "text-slate-600" : "text-white/58"
                            }`}
                          >
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">
              Next handoff
            </p>
            <p className="mt-3 text-lg font-semibold tracking-tight">
              Payroll sign-off at 4:00 PM
            </p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Finance needs overtime reconciliation and three settlement confirmations before release.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
