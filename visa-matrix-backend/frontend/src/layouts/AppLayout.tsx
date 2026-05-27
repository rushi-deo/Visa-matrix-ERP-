import { useState } from "react";
import { Outlet } from "react-router-dom";

import SidebarNav from "../components/layout/SidebarNav";
import TopBar from "../components/layout/TopBar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,114,199,0.18),_transparent_30%),linear-gradient(180deg,_#07121f_0%,_#0b223e_100%)] text-premium-silver-100 md:grid md:grid-cols-[304px_minmax(0,1fr)]">
      <SidebarNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 bg-premium-navy-950/70 backdrop-blur-sm">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="p-6 xl:px-8 xl:pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
