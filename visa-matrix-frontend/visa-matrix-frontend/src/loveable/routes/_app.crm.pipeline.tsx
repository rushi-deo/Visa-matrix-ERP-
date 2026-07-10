import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { fetchLeads } from "@erp/services/api";

const stages = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"] as const;

type Lead = {
  id: string;
  name: string;
  country: string;
  value: number;
  stage: (typeof stages)[number];
};

export const Route = createFileRoute("/_app/crm/pipeline")({
  component: Page,
});

function Page() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchLeads()
      .then((rows) => {
        if (mounted) setLeads(rows as Lead[]);
      })
      .catch(() => {
        if (mounted) setLeads([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader title="Sales Pipeline" description="Drag leads through your funnel." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage) => {
          const items = leads.filter((lead) => lead.stage === stage);
          return (
            <div key={stage} className="min-h-72 rounded-lg bg-muted/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{stage}</h3>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.slice(0, 5).map((lead) => (
                  <Card key={lead.id} className="cursor-grab p-3 hover:shadow-md">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.country}</p>
                    <p className="mt-1 text-xs font-medium">${lead.value.toLocaleString()}</p>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
