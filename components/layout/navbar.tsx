"use client";

import Link from "next/link";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import {
  getBreadcrumbs,
  getRouteSummary,
} from "@/components/layout/workspace-config";

type NavbarProps = {
  pathname: string;
  onMenuClick: () => void;
};

export function Navbar({ pathname, onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const summary = getRouteSummary(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-white/55 bg-[rgba(244,239,231,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/85 shadow-[0_10px_24px_rgba(15,23,42,0.08)] lg:hidden"
            aria-label="Open navigation"
          >
            <span className="space-y-1">
              <span className="block h-0.5 w-5 rounded-full bg-slate-900" />
              <span className="block h-0.5 w-5 rounded-full bg-slate-900" />
              <span className="block h-0.5 w-5 rounded-full bg-slate-900" />
            </span>
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
              {breadcrumbs.map((crumb, index) => (
                <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition hover:text-slate-800">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 ? <span>/</span> : null}
                </div>
              ))}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
              {summary.label}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[0.95rem]">
              {summary.description}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full border border-slate-200/80 bg-white/85 px-4 py-2 text-right shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
              Daily pulse
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Sync healthy · {today}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(220,38,38,0.3)] transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
