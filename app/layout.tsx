import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "Northstar EMS",
    template: "%s | Northstar EMS",
  },
  description: "Unified employee management workspace for HR, operations, payroll, and compliance teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
