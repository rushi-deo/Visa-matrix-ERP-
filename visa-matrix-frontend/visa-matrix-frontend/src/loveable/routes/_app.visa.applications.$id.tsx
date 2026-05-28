import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { applications } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, X, UserPlus } from "lucide-react";
import * as React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
export const Route = createFileRoute("/_app/visa/applications/$id")({ component: Page });
function Page() {
  const { id } = useParams({ from: "/_app/visa/applications/$id" });
  const app = applications.find((a) => a.id === id) ?? applications[0];
  const [approve, setApprove] = React.useState(false);
  const [reject, setReject] = React.useState(false);
  return (
    <>
      <PageHeader title={`${app.appId} — ${app.applicant}`} description={`${app.flag} ${app.country} · ${app.visaType}`}
        actions={<>
          <Button variant="outline"><UserPlus className="size-4 mr-2" />Assign</Button>
          <Button variant="outline" onClick={() => setReject(true)}><X className="size-4 mr-2" />Reject</Button>
          <Button onClick={() => setApprove(true)}><Check className="size-4 mr-2" />Approve</Button>
        </>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardContent className="p-6">
          <Tabs defaultValue="overview">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="notes">Notes</TabsTrigger></TabsList>
            <TabsContent value="overview" className="space-y-3 pt-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Status</p><StatusBadge value={app.status} /></div>
                <div><p className="text-muted-foreground">Priority</p><StatusBadge value={app.priority} /></div>
                <div><p className="text-muted-foreground">Assignee</p><p className="font-medium">{app.assignee}</p></div>
                <div><p className="text-muted-foreground">Submitted</p><p className="font-medium">{app.submitted}</p></div>
                <div><p className="text-muted-foreground">Amount</p><p className="font-medium">${app.amount.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Progress</p><p className="font-medium">{app.progress}%</p></div>
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="pt-4">
              <ol className="relative border-l ml-2 space-y-4">
                {["Application submitted","Initial review","Documents requested","Embassy submission"].map((s, i) => (
                  <li key={s} className="ml-4"><span className="absolute -left-1.5 size-3 rounded-full bg-primary ring-4 ring-card mt-1" />
                    <p className="text-sm font-medium">{s}</p><p className="text-xs text-muted-foreground">2025-1{i}-0{i+1}</p></li>
                ))}
              </ol>
            </TabsContent>
            <TabsContent value="documents" className="pt-4 text-sm text-muted-foreground">Document checklist & previews appear here.</TabsContent>
            <TabsContent value="notes" className="pt-4 text-sm text-muted-foreground">Internal team notes & comments.</TabsContent>
          </Tabs>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Applicant</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2"><p>{app.applicant}</p><p className="text-muted-foreground">{app.email}</p></CardContent></Card>
      </div>
      <ConfirmDialog open={approve} onOpenChange={setApprove} title="Approve application?" description="The applicant will be notified immediately." confirmLabel="Approve" onConfirm={() => { toast.success("Application approved"); setApprove(false); }} />
      <ConfirmDialog open={reject} onOpenChange={setReject} title="Reject application?" description="This action cannot be undone." confirmLabel="Reject" destructive onConfirm={() => { toast.success("Application rejected"); setReject(false); }} />
    </>
  );
}
