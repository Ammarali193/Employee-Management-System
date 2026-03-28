"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { getActiveHref } from "@/components/layout/workspace-config";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (pathname === "/login") {
      return;
    }

    const role = String(localStorage.getItem("role") || "employee").toLowerCase();

    if (role !== "hr") {
      return;
    }

    const hrAllowedPrefixes = [
      "/hr/dashboard",
      "/dashboard",
      "/employees",
      "/leaves",
      "/leave",
      "/attendance",
      "/attendance/reports",
      "/performance",
      "/documents",
      "/holidays",
      "/jobs",
      "/candidates",
      "/lifecycle/jobs",
      "/lifecycle/candidates",
    ];

    const isAllowedPath = hrAllowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

    if (!isAllowedPath) {
      router.replace("/hr/dashboard");
    }
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-100">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Sidebar
        activeHref={getActiveHref(pathname)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="relative lg:pl-[304px]">
        <Navbar
          pathname={pathname}
          onMenuClick={() => setIsSidebarOpen((open) => !open)}
        />
        <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
