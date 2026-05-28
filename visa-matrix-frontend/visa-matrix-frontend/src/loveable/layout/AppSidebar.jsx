import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";

import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Settings,
  Plane,
} from "lucide-react";

export default function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const navGroups = [
    {
      label: "Main",
      items: [
        {
          label: "Dashboard",
          to: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Customers",
          to: "/customers",
          icon: Users,
        },
        {
          label: "Visa Applications",
          to: "/visa-applications",
          icon: FileText,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          label: "Employees",
          to: "/employees",
          icon: Briefcase,
        },
        {
          label: "Settings",
          to: "/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-3 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white">
            <Plane className="h-4 w-4" />
          </div>

          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">
                Visa Matrix
              </span>

              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Immigration ERP
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel>
                {group.label}
              </SidebarGroupLabel>
            )}

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton>
                        <a
                          href={item.to}
                          className="flex items-center gap-2 w-full"
                        >
                          <Icon className="h-4 w-4" />

                          {!collapsed && (
                            <span>{item.label}</span>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}