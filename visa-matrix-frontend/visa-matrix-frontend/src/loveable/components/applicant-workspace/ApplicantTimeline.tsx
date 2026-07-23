import { CalendarClock, CheckCircle2, CircleDot, FileText, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

interface ApplicantTimelineProps {
  applicant: any;
  loading: boolean;
}

const firstValue = (source: any, keys: string[]) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") {
      return source[key];
    }
  }
  return null;
};

const getEventIcon = (type: string) => {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes("document") || normalizedType.includes("upload")) return FileText;
  if (normalizedType.includes("assign") || normalizedType.includes("user")) return UserRound;
  if (normalizedType.includes("approv") || normalizedType.includes("complete")) return CheckCircle2;
  if (normalizedType.includes("schedule") || normalizedType.includes("date")) return CalendarClock;
  return CircleDot;
};

const formatDate = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

export function ApplicantTimeline({ applicant, loading }: ApplicantTimelineProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading timeline...</p>;
  }

  const rawEvents = firstValue(applicant, [
    "timeline",
    "activities",
    "activity",
    "events",
    "statusHistory",
    "status_history",
    "applicationEvents",
    "application_events",
  ]);
  const events = (Array.isArray(rawEvents) ? rawEvents : [])
    .map((event: any, index) => ({
      id: event.id ?? event.event_id ?? `${index}-${event.created_at ?? event.date ?? "event"}`,
      title: firstValue(event, ["title", "eventTitle", "event_title", "name", "type", "event"]) ?? "Application update",
      description: firstValue(event, ["description", "details", "message", "note", "comment"]),
      date: firstValue(event, ["createdAt", "created_at", "timestamp", "date", "occurredAt", "occurred_at", "updated_at"]),
      user: firstValue(event, ["userName", "user_name", "employeeName", "employee_name", "assignedEmployee", "assigned_employee", "actor", "createdBy", "created_by"]),
      status: firstValue(event, ["status", "eventStatus", "event_status"]),
      type: String(firstValue(event, ["type", "eventType", "event_type", "title"]) ?? "event"),
    }))
    .sort((a, b) => {
      const first = new Date(String(a.date ?? "")).getTime();
      const second = new Date(String(b.date ?? "")).getTime();
      return (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first);
    });

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No timeline available.</p>;
  }

  return (
    <div className="relative space-y-4 before:absolute before:bottom-4 before:left-[1.05rem] before:top-4 before:w-px before:bg-border">
      {events.map((event) => {
        const Icon = getEventIcon(event.type);
        return (
          <article key={event.id} className="relative flex gap-3">
            <div className="z-10 grid size-9 shrink-0 place-items-center rounded-full border bg-background text-primary">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-medium">{event.title}</h3>
                {event.status ? <StatusBadge value={String(event.status)} /> : null}
              </div>
              {event.description ? <p className="mt-2 text-sm text-muted-foreground">{event.description}</p> : null}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{formatDate(event.date)}</span>
                {event.user ? <span>User/Employee: {event.user}</span> : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
