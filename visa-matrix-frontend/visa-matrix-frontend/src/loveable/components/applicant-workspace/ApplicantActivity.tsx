import { CircleDot, CircleDollarSign, Eye, FileDown, FileUp, MessageSquare, Pencil, Plus, RefreshCw, UserRound } from "lucide-react";

interface ApplicantActivityProps {
  applicant: any;
  loading: boolean;
  error?: string | null;
}

const firstValue = (source: any, keys: string[]) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") return source[key];
  }
  return null;
};

const getActivityIcon = (type: string) => {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes("creat")) return Plus;
  if (normalizedType.includes("updat") || normalizedType.includes("edit")) return Pencil;
  if (normalizedType.includes("view")) return Eye;
  if (normalizedType.includes("download")) return FileDown;
  if (normalizedType.includes("upload")) return FileUp;
  if (normalizedType.includes("payment") || normalizedType.includes("invoice")) return CircleDollarSign;
  if (normalizedType.includes("note")) return MessageSquare;
  if (normalizedType.includes("assign") || normalizedType.includes("user")) return UserRound;
  if (normalizedType.includes("status") || normalizedType.includes("change")) return RefreshCw;
  return CircleDot;
};

const formatDate = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const formatActivityType = (value: unknown) => {
  const text = String(value ?? "Activity").replace(/[_-]+/g, " ");
  return text.replace(/\b\w/g, (character) => character.toUpperCase());
};

export function ApplicantActivity({ applicant, loading, error }: ApplicantActivityProps) {
  if (loading) return <p className="text-sm text-muted-foreground">Loading activity...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  const rawActivities = firstValue(applicant, [
    "activity",
    "activities",
    "activityLog",
    "activity_log",
    "auditLog",
    "audit_log",
    "events",
    "applicationEvents",
    "application_events",
  ]);
  const activities = (Array.isArray(rawActivities) ? rawActivities : [])
    .map((activity: any, index) => ({
      id: activity.id ?? activity.activity_id ?? activity.event_id ?? `${index}-${activity.created_at ?? activity.timestamp ?? "activity"}`,
      type: firstValue(activity, ["activityType", "activity_type", "type", "eventType", "event_type", "action"]) ?? "Activity",
      description: firstValue(activity, ["description", "details", "message", "actionDescription", "action_description"]) ?? "-",
      user: firstValue(activity, ["userName", "user_name", "employeeName", "employee_name", "actor", "createdBy", "created_by", "user"]) ?? "-",
      date: firstValue(activity, ["createdAt", "created_at", "timestamp", "date", "occurredAt", "occurred_at", "updated_at"]),
    }))
    .sort((first, second) => {
      const firstDate = new Date(String(first.date ?? "")).getTime();
      const secondDate = new Date(String(second.date ?? "")).getTime();
      return (Number.isNaN(secondDate) ? 0 : secondDate) - (Number.isNaN(firstDate) ? 0 : firstDate);
    });

  if (activities.length === 0) return <p className="text-sm text-muted-foreground">No activity available.</p>;

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = getActivityIcon(String(activity.type));
        return (
          <article key={activity.id} className="flex gap-3 rounded-lg border bg-card p-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-medium">{formatActivityType(activity.type)}</h3>
                <time className="text-xs text-muted-foreground">{formatDate(activity.date)}</time>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">By {activity.user}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
