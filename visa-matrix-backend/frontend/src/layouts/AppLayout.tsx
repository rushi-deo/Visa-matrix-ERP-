import { useState } from "react";
import { Outlet } from "react-router-dom";

import SidebarNav from "../components/layout/SidebarNav";
import TopBar from "../components/layout/TopBar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-platinum-50 via-premium-platinum-100 to-premium-platinum-50 text-premium-navy-950 md:grid md:grid-cols-[304px_minmax(0,1fr)]">
      <SidebarNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
