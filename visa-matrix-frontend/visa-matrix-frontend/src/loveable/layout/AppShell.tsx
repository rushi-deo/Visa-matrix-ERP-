import { Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/lib/auth";
import * as React from "react";
import { Toaster } from "@/components/ui/sonner";

export function AppShell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
    const t = setTimeout(() => { if (!user) navigate({ to: "/login" }); }, 0);
    return () => clearTimeout(t);
  }, [user, navigate]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
        <Toaster richColors position="top-right" />
      </SidebarInset>
    </SidebarProvider>
  );
}