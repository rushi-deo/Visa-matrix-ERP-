import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { fetchLeads, type Lead } from "@erp/services/api";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";

export const Route = createFileRoute("/_app/crm/leads")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchLeads()
      .then((rows) => {
        if (mounted) setLeads(rows);
      })
      .catch(() => {
        if (mounted) setLeads([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cols: Column<Lead>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email" },
    { key: "source", header: "Source" },
    { key: "country", header: "Country" },
    { key: "stage", header: "Stage", render: (r) => <StatusBadge value={r.stage} /> },
    { key: "owner", header: "Owner" },
    {
      key: "value",
      header: "Value",
      sortable: true,
      accessor: (r) => r.value,
      render: (r) => `$${r.value.toLocaleString()}`,
    },
  ];

  return (
    <>
      <ModulePage
        title="Leads"
        description="All inbound and outbound leads."
        data={leads}
        columns={cols}
        searchKeys={["name", "email", "owner", "country"]}
        primaryAction="Add Lead"
        onPrimaryAction={() => setShowLeadModal(true)}
        onRowClick={(row) =>
          navigate({
            to: "/crm/leads/$id",
            params: { id: row.id },
          })
        }
      />

      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
          </DialogHeader>

          <p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Lead Name"
                className="w-full rounded border p-2"
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full rounded border p-2"
              />

              <input
                type="text"
                placeholder="Phone"
                className="w-full rounded border p-2"
              />

              <button className="w-full rounded bg-blue-600 p-2 text-white">
                Save Lead
              </button>
            </div>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
