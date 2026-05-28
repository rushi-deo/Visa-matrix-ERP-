import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { leads } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
const stages = ["New","Contacted","Qualified","Proposal","Won","Lost"] as const;
export const Route = createFileRoute("/_app/crm/pipeline")({ component: () => (
  <>
    <PageHeader title="Sales Pipeline" description="Drag leads through your funnel." />
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {stages.map((s) => {
        const items = leads.filter((l) => l.stage === s);
        return (
          <div key={s} className="bg-muted/40 rounded-lg p-3 min-h-72">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">{s}</h3>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2">{items.slice(0,5).map((l) => (
              <Card key={l.id} className="p-3 cursor-grab hover:shadow-md">
                <p className="text-sm font-medium truncate">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.country}</p>
                <p className="text-xs font-medium mt-1">${l.value.toLocaleString()}</p>
              </Card>
            ))}</div>
          </div>
        );
      })}
    </div>
  </>
) });
