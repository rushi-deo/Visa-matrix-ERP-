import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { applications } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, UserPlus } from "lucide-react";
import * as React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import apiClient, { API_ENDPOINTS, extractResponseData } from "@erp/services/apiClient";

export const Route = createFileRoute("/_app/visa/applications/$id")({ component: Page });

function Page() {
  const { id } = useParams({ from: "/_app/visa/applications/$id" });
  const fallbackApp = applications.find((a) => a.id === id) ?? applications[0];
  const [application, setApplication] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [approve, setApprove] = React.useState(false);
  const [reject, setReject] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(API_ENDPOINTS.applicationById(id));
        const data = extractResponseData(response);
        if (mounted) setApplication(data ?? fallbackApp);
      } catch (error) {
        console.error("Failed to load application details:", error);
        if (mounted) setApplication(fallbackApp);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fallbackApp, id]);

  const app = application ?? fallbackApp;
  const applicantName =
    app?.applicant_name ||
    app?.applicantName ||
    app?.full_name ||
    app?.customer?.full_name ||
    app?.applicant ||
    fallbackApp?.applicant ||
    "—";
  const applicationId =
    app?.app_id ||
    app?.appId ||
    app?.application_id ||
    app?.id ||
    fallbackApp?.appId ||
    "—";
  const status = app?.status || app?.application_status || fallbackApp?.status || "Submitted";
  const priority = app?.priority || app?.urgency || fallbackApp?.priority || "Medium";
  const country =
    app?.country?.name ||
    app?.country_name ||
    app?.country ||
    fallbackApp?.country ||
    "—";
  const visaType =
    app?.visa_type?.name ||
    app?.visa_type_name ||
    app?.visa_type ||
    app?.visaType ||
    fallbackApp?.visaType ||
    "—";
  const assignedEmployee =
    app?.assigned_employee?.full_name ||
    app?.assignedEmployee ||
    app?.assigned_to ||
    app?.assignee ||
    fallbackApp?.assignee ||
    "—";
  const createdDate = app?.created_at || app?.createdAt || app?.submitted || fallbackApp?.submitted || "—";
  const updatedDate = app?.updated_at || app?.updatedAt || app?.last_updated || createdDate;
  const passportNumber = app?.passport_number || app?.passportNumber || app?.customer?.passport_number || "—";
  const dob = app?.date_of_birth || app?.dob || app?.customer?.date_of_birth || "—";
  const gender = app?.gender || app?.customer?.gender || "—";
  const nationality = app?.nationality || app?.customer?.nationality || "—";
  const email = app?.email || app?.customer?.email || fallbackApp?.email || "—";
  const phone = app?.phone || app?.customer?.phone || "—";
  const address = app?.address || app?.customer?.address || "—";
  const destinationCountry = app?.destination_country || app?.destinationCountry || country;
  const visaCategory = app?.visa_category || app?.visaCategory || "—";
  const intake = app?.intake || app?.intake_date || "—";
  const university = app?.university || "—";
  const branch = app?.branch || "—";
  const counsellor = app?.counsellor || "—";
  const processor = app?.processor || assignedEmployee;
  const progress = app?.progress ?? fallbackApp?.progress ?? 0;

  return (
    <>
      <PageHeader
        title={`${applicationId} — ${applicantName}`}
        description={`${country} · ${visaType}`}
        actions={
          <>
            <Button variant="outline">
              <UserPlus className="size-4 mr-2" />Assign
            </Button>
            <Button variant="outline" onClick={() => setReject(true)}>
              <X className="size-4 mr-2" />Reject
            </Button>
            <Button onClick={() => setApprove(true)}>
              <Check className="size-4 mr-2" />Approve
            </Button>
          </>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading case workspace…</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applicant</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">{applicantName}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge value={status} />
                    <StatusBadge value={priority} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Application ID</p>
                    <p className="mt-1 font-medium">{applicationId}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Country</p>
                    <p className="mt-1 font-medium">{country}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Visa Type</p>
                    <p className="mt-1 font-medium">{visaType}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Assigned Employee</p>
                    <p className="mt-1 font-medium">{assignedEmployee}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Created Date</p>
                  <p className="mt-1 font-medium">{createdDate}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Last Updated</p>
                  <p className="mt-1 font-medium">{updatedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Applicant Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div><p className="text-muted-foreground">Full Name</p><p className="mt-1 font-medium">{applicantName}</p></div>
                <div><p className="text-muted-foreground">Passport Number</p><p className="mt-1 font-medium">{passportNumber}</p></div>
                <div><p className="text-muted-foreground">Date of Birth</p><p className="mt-1 font-medium">{dob}</p></div>
                <div><p className="text-muted-foreground">Gender</p><p className="mt-1 font-medium">{gender}</p></div>
                <div><p className="text-muted-foreground">Nationality</p><p className="mt-1 font-medium">{nationality}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="mt-1 font-medium">{email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="mt-1 font-medium">{phone}</p></div>
                <div><p className="text-muted-foreground">Address</p><p className="mt-1 font-medium">{address}</p></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div><p className="text-muted-foreground">Destination Country</p><p className="mt-1 font-medium">{destinationCountry}</p></div>
                <div><p className="text-muted-foreground">Visa Category</p><p className="mt-1 font-medium">{visaCategory}</p></div>
                <div><p className="text-muted-foreground">Visa Type</p><p className="mt-1 font-medium">{visaType}</p></div>
                <div><p className="text-muted-foreground">Intake</p><p className="mt-1 font-medium">{intake}</p></div>
                <div><p className="text-muted-foreground">University</p><p className="mt-1 font-medium">{university}</p></div>
                <div><p className="text-muted-foreground">Branch</p><p className="mt-1 font-medium">{branch}</p></div>
                <div><p className="text-muted-foreground">Counsellor</p><p className="mt-1 font-medium">{counsellor}</p></div>
                <div><p className="text-muted-foreground">Processor</p><p className="mt-1 font-medium">{processor}</p></div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">Current status</p>
                <div className="flex items-center gap-2">
                  <StatusBadge value={status} />
                  <span className="text-muted-foreground">{progress}% complete</span>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { title: "Documents", content: "Documents and uploads will appear here." },
              { title: "Timeline", content: "Case milestones and history will appear here." },
              { title: "Payments", content: "Payment records and invoices will appear here." },
              { title: "Tasks", content: "Assigned follow-ups and action items will appear here." },
              { title: "Internal Notes", content: "Internal comments and notes will appear here." },
              { title: "Communication", content: "Email and message history will appear here." },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog open={approve} onOpenChange={setApprove} title="Approve application?" description="The applicant will be notified immediately." confirmLabel="Approve" onConfirm={() => { toast.success("Application approved"); setApprove(false); }} />
      <ConfirmDialog open={reject} onOpenChange={setReject} title="Reject application?" description="This action cannot be undone." confirmLabel="Reject" destructive onConfirm={() => { toast.success("Application rejected"); setReject(false); }} />
    </>
  );
}
