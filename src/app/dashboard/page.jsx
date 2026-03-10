"use client";

import ProtectedRoute from "@/utils/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <p>Welcome to EMS Admin Panel</p>
      </div>
    </ProtectedRoute>
  );
}
