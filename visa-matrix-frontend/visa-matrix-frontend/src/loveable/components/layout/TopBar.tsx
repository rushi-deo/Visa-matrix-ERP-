import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "./Breadcrumbs";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationCenter } from "./NotificationCenter";
import { UserMenu } from "./UserMenu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b bg-background/80 backdrop-blur flex items-center px-3 gap-3">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="hidden md:block"><Breadcrumbs /></div>
      <div className="flex-1" />
      <div className="hidden sm:block"><GlobalSearch /></div>
      <NotificationCenter />
      <UserMenu />
    </header>
  );
}
