import StatusPill from "../common/StatusPill";
import type { ActivityItem } from "../../types";
import { formatDateTime } from "../../utils/formatters";

type ActivityFeedProps = {
  items: ActivityItem[];
};

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </div>
            <StatusPill value={item.status} />
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            {formatDateTime(item.timestamp)}
          </p>
        </article>
      ))}
    </div>
  );
}
