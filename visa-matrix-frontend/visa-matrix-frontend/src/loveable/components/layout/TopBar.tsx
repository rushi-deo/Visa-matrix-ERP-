import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "./Breadcrumbs";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationCenter } from "./NotificationCenter";
import { UserMenu } from "./UserMenu";
import { FilePlus2, Plus, Receipt, UserPlus, Users } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function TopBar() {
  const navigate = useNavigate();
  const actions = [
    { label: "New Application", to: "/visa/applications/new", icon: FilePlus2 },
    { label: "New Lead", to: "/crm/leads", icon: UserPlus },
    { label: "New Customer", to: "/crm/customers", icon: Users },
    { label: "New Invoice", to: "/finance/invoices", icon: Receipt },
  ] as const;

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b bg-white/95 px-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-4">
      <SidebarTrigger className="size-9 shrink-0" />
      <Separator orientation="vertical" className="h-6" />
      <div className="hidden min-w-0 md:block"><Breadcrumbs /></div>
      <div className="min-w-0 flex-1" />
      <div className="hidden min-w-[16rem] sm:block"><GlobalSearch /></div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2 px-2 sm:px-4" aria-label="Quick Actions">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Quick Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Create</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem key={action.label} onClick={() => navigate({ to: action.to })}>
                <Icon className="mr-2 size-4" />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <NotificationCenter />
      <UserMenu />
    </header>
  );
}
