import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
export const Route = createFileRoute("/_app/announcements")({ component: () => (
  <>
    <PageHeader title="Announcements" actions={<Button>New announcement</Button>} />
    <div className="space-y-3">{["Holiday calendar 2026 published","New US visa fees effective Jan 1","Quarterly all-hands on Friday 5 PM","Updated document verification SLA"].map((t, i) => (
      <Card key={i}><CardContent className="p-4 flex gap-3">
        <div className="size-10 rounded-lg bg-warning/10 text-warning grid place-items-center"><Megaphone className="size-5" /></div>
        <div><p className="font-medium">{t}</p><p className="text-sm text-muted-foreground">Posted by Admin · {i+1}d ago</p></div>
      </CardContent></Card>
    ))}</div>
  </>
) });
