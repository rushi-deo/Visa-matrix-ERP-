import React from "react";
import { useAuth } from "../context/AuthContext";

import AppShell from "../loveable/layout/AppShell";

export default function DashboardLayout({ children }) {
  const { loading } = useAuth();

  return (
    <AppShell>
      <main className="flex-1 p-6 overflow-auto">
        {loading ? (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <p>Loading workspace...</p>
          </section>
        ) : (
          children
        )}
      </main>
    </AppShell>
  );
}