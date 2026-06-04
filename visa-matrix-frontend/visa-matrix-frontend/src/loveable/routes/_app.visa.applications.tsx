import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import apiClient, {
  extractResponseData,
  API_ENDPOINTS,
} from "@/services/apiClient";
import * as React from "react";
import type { Application } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/visa/applications")({
  component: Page,
});
function Page() {
  const navigate = useNavigate();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const cols: Column<Application>[] = [
    {
      key: "appId",
      header: "App ID",
      sortable: true,
      render: (r) => <span className="font-medium">{r.appId}</span>,
    },
    { key: "applicant", header: "Applicant", sortable: true },
    {
      key: "country",
      header: "Country",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          <span>{r.flag}</span>
          {r.country}
        </span>
      ),
    },
    { key: "visaType", header: "Visa Type" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge value={r.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (r) => <StatusBadge value={r.priority} />,
    },
    { key: "assignee", header: "Assignee" },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      accessor: (r) => r.amount,
      render: (r) => `$${r.amount.toLocaleString()}`,
    },
  ];
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await apiClient.get(API_ENDPOINTS.applications);
        const data = extractResponseData(resp) ?? [];
        if (mounted) setApplications(Array.isArray(data) ? data : []);
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
    <ModulePage
      title="Visa Applications"
      description="Track and manage every visa case across countries."
      data={applications}
      columns={cols}
      searchKeys={["applicant", "appId", "country", "visaType", "assignee"]}
      primaryAction="New Application"
      isLoading={loading}
      error={error ?? undefined}
      emptyMessage={
        !loading && !error && applications.length === 0
          ? "No applications found."
          : undefined
      }
      rowAction={(r) => (
        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            navigate({ to: "/visa/applications/$id", params: { id: r.id } })
          }
        >
          <Eye className="size-4" />
        </Button>
      )}
    />
  );
}
