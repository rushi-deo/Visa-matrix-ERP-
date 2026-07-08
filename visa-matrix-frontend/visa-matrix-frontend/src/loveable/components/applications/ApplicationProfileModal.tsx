import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Application } from "@/lib/mock-data";
import { CalendarDays, CircleDollarSign, Clock3, FileText, MessageSquare, ShieldCheck, UserRound } from "lucide-react";

interface ApplicationProfileModalProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function ModalHeader({ application }: { application: Application }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <DialogTitle className="text-xl">{application.applicant}</DialogTitle>
        <DialogDescription className="mt-1">
          {application.appId} • {application.flag} {application.country} • {application.visaType}
        </DialogDescription>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge value={application.status} />
        <StatusBadge value={application.priority} />
      </div>
    </div>
  );
}

function OverviewPanel({ application }: { application: Application }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SummaryItem label="Applicant" value={application.applicant} />
        <SummaryItem label="Email" value={application.email} />
        <SummaryItem label="Assignee" value={application.assignee} />
        <SummaryItem label="Submitted" value={application.submitted} />
        <SummaryItem label="Amount" value={`$${application.amount.toLocaleString()}`} />
        <SummaryItem label="Progress" value={`${application.progress}%`} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This application is currently in {application.status.toLowerCase()} and is flagged with {application.priority.toLowerCase()} priority.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="mb-1 font-medium text-foreground">Case owner</p>
              <p>{application.assignee}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="mb-1 font-medium text-foreground">Destination</p>
              <p>{application.flag} {application.country}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentsPanel({ application }: { application: Application }) {
  const docs = [
    { name: "Passport copy", type: "Identity", status: application.progress > 60 ? "Verified" : "Pending" },
    { name: "Financial statement", type: "Finance", status: application.progress > 40 ? "Verified" : "Pending" },
    { name: "Supporting letter", type: "Employment", status: application.progress > 80 ? "Verified" : "Pending" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {docs.map((doc) => (
          <div key={doc.name} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.type}</p>
              </div>
            </div>
            <Badge variant={doc.status === "Verified" ? "default" : "secondary"}>{doc.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TimelinePanel({ application }: { application: Application }) {
  const events = [
    { title: "Application submitted", date: application.submitted, current: true },
    { title: "Initial review", date: application.submitted, current: false },
    { title: "Document verification", date: application.submitted, current: false },
    { title: "Case update", date: application.submitted, current: false },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {events.map((event) => (
            <li key={event.title} className="flex gap-3">
              <div className="mt-1 flex size-8 items-center justify-center rounded-full border bg-background">
                <Clock3 className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.current ? <Badge>Current</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{event.date}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function NotesPanel({ application }: { application: Application }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="rounded-lg border p-3">
          <p className="font-medium text-foreground">Internal note</p>
          <p className="mt-1">{application.applicant} is awaiting final review from {application.assignee}.</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="font-medium text-foreground">Next action</p>
          <p className="mt-1">Confirm supporting documentation and update the case owner before the next review cycle.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentsPanel({ application }: { application: Application }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Application fee</p>
              <p className="text-xs text-muted-foreground">{application.appId}</p>
            </div>
          </div>
          <p className="font-medium">${application.amount.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Service coverage</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
          <Badge>Paid</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function CommunicationPanel({ application }: { application: Application }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Communication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <MessageSquare className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Applicant update</p>
            <p className="mt-1 text-sm text-muted-foreground">{application.applicant} requested a status update for the current review stage.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <UserRound className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Internal follow-up</p>
            <p className="mt-1 text-sm text-muted-foreground">{application.assignee} is monitoring the next milestone for this case.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationProfileModal({ application, open, onOpenChange }: ApplicationProfileModalProps) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] h-[90vh] max-w-[90vw] w-[90vw] overflow-hidden p-0">
        <div className="flex h-full flex-col">
          <div className="border-b px-6 py-5">
            <DialogHeader className="text-left">
              <ModalHeader application={application} />
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4 flex flex-wrap justify-start gap-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <OverviewPanel application={application} />
              </TabsContent>
              <TabsContent value="documents">
                <DocumentsPanel application={application} />
              </TabsContent>
              <TabsContent value="timeline">
                <TimelinePanel application={application} />
              </TabsContent>
              <TabsContent value="notes">
                <NotesPanel application={application} />
              </TabsContent>
              <TabsContent value="payments">
                <PaymentsPanel application={application} />
              </TabsContent>
              <TabsContent value="communication">
                <CommunicationPanel application={application} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex items-center justify-between border-t px-6 py-3 text-sm text-muted-foreground">
            <span>Enterprise application profile</span>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <span>{application.submitted}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
