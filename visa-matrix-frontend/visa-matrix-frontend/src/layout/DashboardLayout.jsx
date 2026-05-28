import React from "react";
import { useAuth } from "../context/AuthContext";

import { SidebarProvider } from "../loveable/ui/sidebar";
import AppSidebar from "../loveable/layout/AppSidebar";
import TopBar from "../loveable/layout/TopBar";
import AppShell from "../loveable/layout/AppShell";

export default function DashboardLayout({ children }) {
  const { loading } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />

        <AppShell>
          <TopBar />

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
      </div>
    </SidebarProvider>
  );
}