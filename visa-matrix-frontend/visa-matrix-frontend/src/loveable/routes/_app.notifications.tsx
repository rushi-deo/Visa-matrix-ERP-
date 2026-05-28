import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
const dot: Record<string,string> = { info:"bg-info", success:"bg-success", warning:"bg-warning", danger:"bg-destructive" };
export const Route = createFileRoute("/_app/notifications")({ component: () => (
  <>
    <PageHeader title="Notifications" />
    <Card><CardContent className="p-0 divide-y">{notifications.map((n) => (
      <div key={n.id} className={cn("flex items-start gap-3 p-4", n.unread && "bg-accent/30")}>
        <span className={cn("size-2 rounded-full mt-2", dot[n.type])} />
        <div className="flex-1"><p className="font-medium text-sm">{n.title}</p><p className="text-sm text-muted-foreground">{n.desc}</p></div>
        <span className="text-xs text-muted-foreground">{n.time}</span>
      </div>
    ))}</CardContent></Card>
  </>
) });
