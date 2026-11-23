import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
import { ApplicationProfileModal, type Application } from "@/components/applications/ApplicationProfileModal";
import { fetchApplications } from "@erp/services/application.service";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/visa/approvals")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchApplications()
      .then((rows) => {
        if (mounted) setApplications(rows.map(toApplicationProfile));
      })
      .catch(() => {
        if (mounted) setApplications([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const data = applications.filter(
    (a) => a.status === "Under Review" || a.status === "Submitted"
  );

  const cols: Column<Application>[] = [
    {
      key: "appId",
      header: "App ID",
      render: (r) => (
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={(event) => {
            event.stopPropagation();
            navigate({
              to: "/visa/applications/$id",
              params: { id: r.id },
            });
          }}
        >
          {r.appId}
        </button>
      ),
    },
    {
      key: "applicant",
      header: "Applicant",
      render: (r) => (
        <button
          type="button"
          className="font-semibold text-left text-foreground hover:underline"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setSelectedApplication(r);
            setProfileOpen(true);
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          {r.applicant}
        </button>
      ),
    },
    {
      key: "country",
      header: "Country",
      render: (r) => `${r.flag} ${r.country}`,
    },
    {
      key: "priority",
      header: "Priority",
      render: (r) => <StatusBadge value={r.priority} />,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge value={r.status} />,
    },
  ];

  return (
    <>
      <ModulePage
        title="Approval Center"
        description="Pending applications awaiting your review."
        data={data}
        columns={cols}
        searchKeys={["applicant", "appId", "country"]}
        rowAction={() => (
          <div className="flex gap-1">
            <Button size="sm" variant="outline">
              <X className="size-3" />
            </Button>
            <Button size="sm">
              <Check className="size-3" />
            </Button>
          </div>
        )}

        onRowClick={undefined}
      />
      <ApplicationProfileModal
        application={selectedApplication}
        open={profileOpen}
        onOpenChange={(open) => {
          setProfileOpen(open);
          if (!open) {
            setSelectedApplication(null);
          }
        }}
      />
    </>
  );
}

function toApplicationProfile(value: unknown): Application {
  const record: Record<string, unknown> =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  const text = (value: unknown) => typeof value === "string" ? value : "";
  const number = (value: unknown) => typeof value === "number" ? value : Number(value ?? 0);

  return {
    id: text(record.id),
    applicant: text(record.customerName ?? record.customer_name),
    appId: text(record.applicationCode ?? record.application_number ?? record.id),
    flag: text(record.flag),
    country: text(record.destinationCountry ?? record.destination_country ?? record.country),
    visaType: text(record.visaType ?? record.visa_type),
    status: text(record.status) || "Submitted",
    priority: text(record.priority) || "Normal",
    email: text(record.email),
    assignee: text(record.assignedEmployee ?? record.assigned_employee ?? record.assigned_to),
    submitted: text(record.submissionDate ?? record.submission_date ?? record.createdAt ?? record.created_at),
    amount: number(record.amount),
    progress: number(record.progress),
  };
}
