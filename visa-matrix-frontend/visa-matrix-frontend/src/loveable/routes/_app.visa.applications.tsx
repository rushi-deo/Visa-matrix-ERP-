import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import apiClient, {
  extractResponseData,
  API_ENDPOINTS,
} from "@erp/services/apiClient";
import * as React from "react";
import ApplicationCreateDialog from "@/components/applications/ApplicationCreateDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/common/DataTable";
import { ApplicantWorkspace } from "@/components/applicant-workspace/ApplicantWorkspace";
import { WorkspaceDivider } from "@/components/applicant-workspace/WorkspaceDivider";
type Application = {
  id: string;
  application_number: string;
  customer_name: string;
  destination_country: string;
  visa_type: string;
  status: string;
  stage: string;
  assigned_employee: string;
  created_at: string;
  updated_at: string;
  payment_status: string;
};
export const Route = createFileRoute("/_app/visa/applications")({
  component: Page,
});
function Page() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [selectedApplicationId, setSelectedApplicationId] =
    React.useState<string | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = React.useState(58);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const workspaceOpen = selectedApplicationId !== null;
  const cols: Column<Application>[] = [
    {
      key: "application_number",
      header: "Application Number",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-primary hover:underline">
          {r.application_number || r.id}
        </span>
      ),
    },
    {
      key: "customer_name",
      header: "Customer Name",
      sortable: true,
      render: (r) => (
        <span className="text-left text-foreground hover:underline">
          {r.customer_name || "-"}
        </span>
      ),
    },
    {
      key: "destination_country",
      header: "Destination Country",
    },
    { key: "visa_type", header: "Visa Type" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge value={r.status} />,
    },
    {
      key: "stage",
      header: "Stage",
      render: (r) => <StatusBadge value={r.stage} />,
    },
    { key: "assigned_employee", header: "Assigned Employee" },
    {
      key: "created_at",
      header: "Created Date",
      render: (r) => r.created_at || "-",
    },
    {
      key: "updated_at",
      header: "Updated Date",
      render: (r) => r.updated_at || "-",
    },
    { key: "payment_status", header: "Payment Status" },
  ];
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await apiClient.get(API_ENDPOINTS.applications);
        const data = extractResponseData(resp);
        const items = Array.isArray(data?.items) ? data.items : [];
        if (mounted) setApplications(items);
      } catch (err: any) {
        console.error("Failed to load applications:", err);
        if (mounted) setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="flex min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-lg border bg-background">
        {!isFullScreen ? (
          <div
            className="min-w-0 overflow-auto p-6"
            style={{ width: workspaceOpen ? `${leftPanelWidth}%` : "100%" }}
          >
            <ModulePage
        title="Visa Applications"
        description="Track and manage every visa case across countries."
        data={applications}
        columns={cols}
        searchKeys={[
          "application_number",
          "customer_name",
          "destination_country",
          "visa_type",
          "assigned_employee",
          "status",
          "stage",
        ]}
        primaryAction="New Application"
        onPrimaryAction={() => {
          console.log("New Application clicked");
          setCreateOpen(true);
        }}
        selectedRowId={selectedApplicationId}
        isLoading={loading}
        error={error ?? undefined}
        emptyMessage={
          !loading && !error && applications.length === 0
            ? "No applications found."
            : undefined
        }
        onRowClick={(r) => {
          setSelectedApplicationId(r.id);
        }}
            />
          </div>
        ) : null}
        {workspaceOpen && !isFullScreen ? (
          <WorkspaceDivider
            onDrag={(deltaX) => {
              setLeftPanelWidth((current) =>
                Math.min(75, Math.max(25, current + (deltaX / window.innerWidth) * 100)),
              );
            }}
          />
        ) : null}
        {workspaceOpen ? (
          <ApplicantWorkspace
            applicationId={selectedApplicationId}
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen((current) => !current)}
            onClose={() => {
              setSelectedApplicationId(null);
              setIsFullScreen(false);
            }}
          />
        ) : null}
      </div>
      <ApplicationCreateDialog
        open={createOpen}
        onOpenChange={(v) => setCreateOpen(v)}
        onCreated={async () => {
          // refresh table
          setLoading(true);
          try {
            const resp = await apiClient.get(API_ENDPOINTS.applications);
            const data = extractResponseData(resp);
            const items = Array.isArray(data?.items) ? data.items : [];
            setApplications(items);
          } catch (err: any) {
            console.error("Failed to refresh applications:", err);
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
}
