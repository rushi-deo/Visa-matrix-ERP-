import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, UserPlus } from "lucide-react";
import * as React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { fetchApplicationById } from "@erp/services/application.service";
import { asApiRecord, type ApiRecord, readApiString, readApiValue } from "@/lib/api-record";

export const Route = createFileRoute("/_app/visa/applications/$id")({
  component: Page,
});

function Page() {
  const { id } = useParams({ from: "/_app/visa/applications/$id" });
  const [application, setApplication] = React.useState<ApiRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [approve, setApprove] = React.useState(false);
  const [reject, setReject] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchApplicationById(id);
        if (mounted) setApplication(asApiRecord(data));
      } catch (error) {
        console.error("Failed to load application details:", error);
        if (mounted) setApplication(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const app: ApiRecord = application ?? {};
  const customer = asApiRecord(app.customer);
  const countryRecord = asApiRecord(app.country);
  const visaTypeRecord = asApiRecord(app.visa_type);
  const employeeRecord = asApiRecord(app.assigned_employee);
  const field = (record: ApiRecord, keys: readonly string[], fallback = "—") =>
    readApiString(record, keys) ?? fallback;
  const applicantName = field(app, ["applicant_name", "applicantName", "full_name", "applicant"], field(customer ?? {}, ["full_name", "name"]));
  const applicationId = field(app, ["app_id", "appId", "application_id", "id"]);
  const status = field(app, ["status", "application_status"], "Submitted");
  const priority = field(app, ["priority", "urgency"], "Medium");
  const country = readApiString(countryRecord, ["name"]) ?? field(app, ["country_name", "country"]);
  const visaType = readApiString(visaTypeRecord, ["name"]) ?? field(app, ["visa_type_name", "visa_type", "visaType"]);
  const assignedEmployee = readApiString(employeeRecord, ["full_name", "name"]) ?? field(app, ["assignedEmployee", "assigned_to", "assignee"]);
  const createdDate = field(app, ["created_at", "createdAt", "submitted"]);
  const updatedDate = field(app, ["updated_at", "updatedAt", "last_updated"], createdDate);
  const passportNumber = field(app, ["passport_number", "passportNumber"], field(customer ?? {}, ["passport_number"]));
  const dob = field(app, ["date_of_birth", "dob"], field(customer ?? {}, ["date_of_birth"]));
  const gender = field(app, ["gender"], field(customer ?? {}, ["gender"]));
  const nationality = field(app, ["nationality"], field(customer ?? {}, ["nationality"]));
  const email = field(app, ["email"], field(customer ?? {}, ["email"]));
  const phone = field(app, ["phone"], field(customer ?? {}, ["phone"]));
  const address = field(app, ["address"], field(customer ?? {}, ["address"]));
  const destinationCountry = field(app, ["destination_country", "destinationCountry"], country);
  const visaCategory = field(app, ["visa_category", "visaCategory"]);
  const intake = field(app, ["intake", "intake_date"]);
  const university = field(app, ["university"]);
  const branch = field(app, ["branch"]);
  const counsellor = field(app, ["counsellor"]);
  const processor = field(app, ["processor"], assignedEmployee);
  const progress = Number(readApiValue(app, ["progress"]) ?? 0);

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
        </div>
      )}

      <ConfirmDialog open={approve} onOpenChange={setApprove} title="Approve application?" description="The applicant will be notified immediately." confirmLabel="Approve" onConfirm={() => { toast.success("Application approved"); setApprove(false); }} />
      <ConfirmDialog open={reject} onOpenChange={setReject} title="Reject application?" description="This action cannot be undone." confirmLabel="Reject" destructive onConfirm={() => { toast.success("Application rejected"); setReject(false); }} />
    </>
  );
}
