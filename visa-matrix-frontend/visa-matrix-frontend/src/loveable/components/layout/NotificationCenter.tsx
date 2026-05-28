import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, CheckCheck } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const dot: Record<string, string> = {
  info: "bg-info", success: "bg-success", warning: "bg-warning", danger: "bg-destructive",
};
export function NotificationCenter() {
  const unread = notifications.filter((n) => n.unread).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div>
            <p className="font-medium text-sm">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread} unread</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs"><CheckCheck className="size-3.5" /> Mark all read</Button>
        </div>
        <ScrollArea className="h-80">
          <ul>
            {notifications.map((n) => (
              <li key={n.id} className={cn("flex gap-3 p-3 border-b hover:bg-muted/40", n.unread && "bg-accent/30")}>
                <span className={cn("size-2 rounded-full mt-2 shrink-0", dot[n.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="w-full">View all notifications</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
