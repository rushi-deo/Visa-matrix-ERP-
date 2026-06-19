import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ModulePage } from "@/components/common/ModulePage";
import { invoices, type Invoice } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Column } from "@/components/common/DataTable";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/finance/invoices")({
  component: () => {
    const navigate = useNavigate();

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const cols: Column<Invoice>[] = [
      { key: "invoiceNo", header: "Invoice #", sortable: true },
      { key: "customer", header: "Customer" },
      { key: "issued", header: "Issued" },
      { key: "due", header: "Due" },
      {
        key: "amount",
        header: "Amount",
        render: (r) => `$${r.amount.toLocaleString()}`,
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
          title="Invoices"
          description="All client invoices and billing."
          data={invoices}
          columns={cols}
          searchKeys={["invoiceNo", "customer"]}
          primaryAction="Create Invoice"
          onPrimaryAction={() => setShowInvoiceModal(true)}
          onRowClick={(row) =>
            navigate({
              to: "/finance/invoices/$id",
              params: { id: row.id },
            })
          }
          rowAction={() => (
            <Button size="icon" variant="ghost">
              <Download className="size-4" />
            </Button>
          )}
        />

        <Dialog
          open={showInvoiceModal}
          onOpenChange={setShowInvoiceModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input placeholder="Customer Name" />

              <Input
                type="number"
                placeholder="Amount"
              />

              <Input placeholder="Status" />

              <Textarea placeholder="Notes" />

              <Button className="w-full">
                Save Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
});