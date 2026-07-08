import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { applications, type Application } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
import { ApplicationProfileModal } from "@/components/applications/ApplicationProfileModal";

export const Route = createFileRoute("/_app/visa/approvals")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

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
            event.stopPropagation();
            setSelectedApplication(r);
            setProfileOpen(true);
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