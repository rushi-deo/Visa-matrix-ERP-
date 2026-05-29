import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { navGroups } from "@/lib/nav-config";
import { useAuth } from "@/lib/auth";
import { Plane } from "lucide-react";

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { hasRole } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Plane className="size-5" />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">Visa Matrix</span>
              <span className="truncate text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/60">Immigration ERP</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-3 px-2 py-3">
        {navGroups.map((group) => {
          const items = group.items.filter((i) => !i.roles || hasRole(i.roles));
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label} className="px-1 py-0">
              {!collapsed && (
                <SidebarGroupLabel className="mb-1 h-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map((item) => {
                    const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className="relative h-9 rounded-md px-3 text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]"
                        >
                          <Link to={item.to} onClick={() => isMobile && setOpenMobile(false)}>
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="rounded-md border border-sidebar-border bg-white/[0.03] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Operations
            </p>
            <p className="mt-1 text-xs leading-5 text-sidebar-foreground/75">
              Visa cases, customers, finance, HR, and system controls.
            </p>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
