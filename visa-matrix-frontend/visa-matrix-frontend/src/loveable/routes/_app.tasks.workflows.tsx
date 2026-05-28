import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch } from "lucide-react";
export const Route = createFileRoute("/_app/tasks/workflows")({ component: () => (
  <>
    <PageHeader title="Workflow Automation" description="Define triggers, actions and approval chains." />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {["New application intake","Document verification","Embassy submission","Payment received","Visa rejected escalation","Onboarding new client"].map((w) => (
        <Card key={w}><CardContent className="p-5">
          <div className="size-10 rounded-lg bg-info/10 text-info grid place-items-center mb-3"><GitBranch className="size-5" /></div>
          <p className="font-medium">{w}</p><p className="text-sm text-muted-foreground mt-1">Active · 3 steps · 12 runs today</p>
        </CardContent></Card>
      ))}
    </div>
  </>
) });
