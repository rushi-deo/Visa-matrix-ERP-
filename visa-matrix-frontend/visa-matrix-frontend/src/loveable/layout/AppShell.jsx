import React from "react";
import { SidebarProvider, SidebarInset } from "../ui/sidebar";

import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";

export default function AppShell({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="bg-slate-50 min-h-screen">
        <TopBar />

        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}