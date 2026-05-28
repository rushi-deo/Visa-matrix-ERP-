import React from "react";

import { SidebarTrigger } from "../ui/sidebar";

import Breadcrumbs from "./Breadcrumbs";
import GlobalSearch from "./GlobalSearch";
import NotificationCenter from "./NotificationCenter";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white px-4 shadow-sm">
      <SidebarTrigger />

      <div className="hidden md:block">
        <Breadcrumbs />
      </div>

      <div className="flex-1" />

      <div className="hidden sm:block">
        <GlobalSearch />
      </div>

      <NotificationCenter />

      <div className="flex items-center gap-2 rounded-full border px-3 py-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
          A
        </div>

        <div className="hidden sm:flex sm:flex-col">
          <span className="text-sm font-medium">
            Admin
          </span>

          <span className="text-xs text-slate-500">
            Super Admin
          </span>
        </div>
      </div>
    </header>
  );
}