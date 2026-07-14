import * as React from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, User, Shield, HelpCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = React.useState(false);
  const initials = (user?.name ?? "U").split(" ").map((s) => s[0]).slice(0,2).join("").toUpperCase();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="size-8"><AvatarImage src={user?.avatar} /><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium">{user?.name ?? "Guest"}</span>
              <span className="text-[11px] text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/hr/employees" })}><User className="size-4 mr-2" /> My Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}><Settings className="size-4 mr-2" /> Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/settings/security" })}><Shield className="size-4 mr-2" /> Security</DropdownMenuItem>
          <DropdownMenuItem><HelpCircle className="size-4 mr-2" /> Help & Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirm(true)}>
            <LogOut className="size-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Log out?" description="You'll need to sign in again to access the dashboard."
        confirmLabel="Log out" destructive onConfirm={async () => { await logout(); navigate({ to: "/login" }); }} />
    </>
  );
}
