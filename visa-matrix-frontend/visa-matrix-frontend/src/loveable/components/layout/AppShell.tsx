import { Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/lib/auth";
import * as React from "react";
import { Toaster } from "@/components/ui/sonner";

export function AppShell() {
  const { user, isHydrated, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, isHydrated, navigate]);

  if (!isHydrated || loading || !user) {
    return null;
  }

  return (
    <SidebarProvider className="bg-background text-foreground">
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-x-hidden bg-background">
        <TopBar />
        <main className="w-full min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px] min-w-0">
            <Outlet />
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </SidebarInset>
    </SidebarProvider>
  );
}
