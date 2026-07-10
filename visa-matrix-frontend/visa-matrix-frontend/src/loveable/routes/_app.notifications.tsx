import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fetchNotifications } from "@erp/services/notifications.service";

const dot: Record<string, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

type Notification = {
  id: string | number;
  title: string;
  desc: string;
  time: string;
  unread?: boolean;
  type: keyof typeof dot;
};

export const Route = createFileRoute("/_app/notifications")({
  component: Page,
});

function Page() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchNotifications()
      .then((rows) => {
        if (!mounted) return;
        setNotifications(rows as Notification[]);
      })
      .catch(() => {
        if (mounted) setNotifications([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader title="Notifications" />
      <Card>
        <CardContent className="divide-y p-0">
          {notifications.map((n) => (
            <div key={n.id} className={cn("flex items-start gap-3 p-4", n.unread && "bg-accent/30")}>
              <span className={cn("mt-2 size-2 rounded-full", dot[n.type])} />
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
