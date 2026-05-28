import React from "react";

import {
  User,
  Settings,
  LogOut,
} from "lucide-react";

export default function UserMenu() {
  return (
    <div className="relative">
      <button className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 hover:bg-slate-50">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
          A
        </div>

        <div className="hidden text-left md:flex md:flex-col">
          <span className="text-sm font-medium">
            Admin User
          </span>

          <span className="text-xs text-slate-500">
            Super Admin
          </span>
        </div>
      </button>

      <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border bg-white shadow-lg">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">
            admin@visamatrix.com
          </p>
        </div>

        <div className="p-2">
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100">
            <User className="h-4 w-4" />
            My Profile
          </button>

          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100">
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}