import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const c: Record<string,string> = {
  success: "bg-success", info: "bg-info", warning: "bg-warning", danger: "bg-destructive",
};
type ActivityItem = { id: string | number; who: string; action: string; target: string; time: string; type: keyof typeof c };

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
      <CardContent>
        <ol className="relative border-l ml-2 space-y-4">
          {activities.map((a) => (
            <li key={a.id} className="ml-4">
              <span className={cn("absolute -left-1.5 mt-1.5 size-3 rounded-full ring-4 ring-card", c[a.type])} />
              <p className="text-sm"><span className="font-medium">{a.who}</span> {a.action} <span className="font-medium">{a.target}</span></p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
