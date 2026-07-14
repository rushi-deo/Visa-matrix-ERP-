import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  delta?: number;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "info" | "destructive";
}
const accents: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};
export function StatCard({ label, value, delta, icon: Icon, hint, accent = "primary" }: Props) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          {Icon && (
            <div className={cn("size-10 rounded-lg grid place-items-center", accents[accent])}>
              <Icon className="size-5" />
            </div>
          )}
        </div>
        {delta !== undefined && (
          <div className={cn("mt-3 flex items-center gap-1 text-xs font-medium",
            up ? "text-success" : "text-destructive")}>
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta)}% <span className="text-muted-foreground font-normal">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
