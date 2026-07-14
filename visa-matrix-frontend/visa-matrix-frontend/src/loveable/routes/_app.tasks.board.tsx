import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { tasks } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
const cols = [{k:"todo",l:"To do"},{k:"in_progress",l:"In progress"},{k:"review",l:"Review"},{k:"done",l:"Done"}];
export const Route = createFileRoute("/_app/tasks/board")({ component: () => (
  <>
    <PageHeader title="Task Board" description="Drag and drop tasks across stages." />
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {cols.map((c) => { const items = tasks.filter((t) => t.status === c.k); return (
        <div key={c.k} className="bg-muted/40 rounded-lg p-3 min-h-72">
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold">{c.l}</h3><span className="text-xs text-muted-foreground">{items.length}</span></div>
          <div className="space-y-2">{items.map((t) => (
            <Card key={t.id} className="p-3 cursor-grab"><p className="text-sm font-medium">{t.title}</p>
              <div className="flex items-center justify-between mt-2"><span className="text-xs text-muted-foreground">{t.assignee}</span><StatusBadge value={t.priority} /></div>
            </Card>
          ))}</div>
        </div>
      ); })}
    </div>
  </>
) });
