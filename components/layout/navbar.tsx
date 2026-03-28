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
  const { logout, role } = useContext(AuthContext);

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

  const displayName = role === "admin" ? "Admin User" : "Team Member";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1600px] items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm lg:hidden"
            aria-label="Open navigation"
          >
            <span className="space-y-1">
              <span className="block h-0.5 w-5 rounded-full bg-gray-800" />
              <span className="block h-0.5 w-5 rounded-full bg-gray-800" />
              <span className="block h-0.5 w-5 rounded-full bg-gray-800" />
            </span>
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition hover:text-gray-800">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 ? <span>/</span> : null}
                </div>
              ))}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-800 sm:text-[2rem]">
              {summary.label}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500 sm:text-[0.95rem]">
              {summary.description}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
            {today}
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
              <path d="M9 17a3 3 0 0 0 6 0" />
            </svg>
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-green-500" />
          </button>
          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="pr-2">
              <p className="text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500">{role ?? "employee"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
