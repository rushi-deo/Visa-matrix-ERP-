import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  approved: "bg-success/15 text-success border-success/30",
  paid: "bg-success/15 text-success border-success/30",
  active: "bg-success/15 text-success border-success/30",
  verified: "bg-success/15 text-success border-success/30",
  won: "bg-success/15 text-success border-success/30",
  done: "bg-success/15 text-success border-success/30",
  success: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  "on hold": "bg-warning/15 text-warning border-warning/30",
  "on leave": "bg-warning/15 text-warning border-warning/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  lost: "bg-destructive/15 text-destructive border-destructive/30",
  inactive: "bg-muted text-muted-foreground border-border",
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
  medium: "bg-info/15 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
  submitted: "bg-info/15 text-info border-info/30",
  "under review": "bg-info/15 text-info border-info/30",
  contacted: "bg-info/15 text-info border-info/30",
  qualified: "bg-info/15 text-info border-info/30",
  proposal: "bg-info/15 text-info border-info/30",
  refunded: "bg-muted text-muted-foreground border-border",
  new: "bg-accent text-accent-foreground border-border",
};

export function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase();
  const cls = map[key] ?? "bg-secondary text-secondary-foreground border-border";
  return <Badge variant="outline" className={cn("font-medium", cls)}>{value}</Badge>;
}
