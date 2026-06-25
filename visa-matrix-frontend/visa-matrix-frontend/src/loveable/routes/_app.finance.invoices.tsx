import { useEffect, useState } from "react";
import { createFileRoute, useNavigate,Outlet } from "@tanstack/react-router";
import {
  fetchPayments,
  createInvoice,
} from "../../services/payments.service";

import { ModulePage } from "@/components/common/ModulePage";
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
    const [invoiceData, setInvoiceData] = useState<any[]>([]);
const [invoiceForm, setInvoiceForm] = useState({
  customer: "",
  amount: "",
  status: "unpaid",
  notes: "",
});
    useEffect(() => {
      const loadInvoices = async () => {
        try {
          const data = await fetchPayments();
          setInvoiceData(data || []);
        } catch (error) {
          console.error("Failed to load invoices:", error);
        }
      };

      loadInvoices();
    }, []);
    const handleCreateInvoice = async () => {
  try {
    await createInvoice({
      customer_name: invoiceForm.customer,
      amount: Number(invoiceForm.amount),
      status: invoiceForm.status,
      notes: invoiceForm.notes,
    });

    const refreshedInvoices = await fetchPayments();
    setInvoiceData(refreshedInvoices);

    setShowInvoiceModal(false);

    setInvoiceForm({
      customer: "",
      amount: "",
      status: "unpaid",
      notes: "",
    });

    alert("Invoice created successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to create invoice");
  }
};

    const cols: Column<any>[] = [
      {
        key: "invoiceNo",
        header: "Invoice #",
        sortable: true,
      },
      {
        key: "customer",
        header: "Customer",
      },
      {
        key: "issued",
        header: "Issued",
      },
      {
        key: "due",
        header: "Due",
      },
      {
        key: "amount",
        header: "Amount",
        render: (r) => `$${Number(r.amount || 0).toLocaleString()}`,
      },
      {
        key: "status",
        header: "Status",
        render: (r) => <StatusBadge value={r.status} />,
      },
    ];

   const currentPath = window.location.pathname;
const isDetailPage =
  currentPath !== "/finance/invoices" &&
  currentPath.startsWith("/finance/invoices/");

if (isDetailPage) {
  return <Outlet />;
}

return (
  <>
    <ModulePage
      title="Invoices"
      description="All client invoices and billing."
      data={invoiceData}
      columns={cols}
      searchKeys={["invoiceNo", "customer"]}
      primaryAction="Create Invoice"
      onPrimaryAction={() => setShowInvoiceModal(true)}
      onRowClick={(row) =>
        navigate({
          to: "/finance/invoices/$id",
          params: { id: String(row.id) },
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
          <Input
            placeholder="Customer Name"
            value={invoiceForm.customer}
            onChange={(e) =>
              setInvoiceForm({
                ...invoiceForm,
                customer: e.target.value,
              })
            }
          />

          <Input
            type="number"
            placeholder="Amount"
            value={invoiceForm.amount}
            onChange={(e) =>
              setInvoiceForm({
                ...invoiceForm,
                amount: e.target.value,
              })
            }
          />

          <Input
            placeholder="Status"
            value={invoiceForm.status}
            onChange={(e) =>
              setInvoiceForm({
                ...invoiceForm,
                status: e.target.value,
              })
            }
          />

          <Textarea
            placeholder="Notes"
            value={invoiceForm.notes}
            onChange={(e) =>
              setInvoiceForm({
                ...invoiceForm,
                notes: e.target.value,
              })
            }
          />

          <Button
            className="w-full"
            onClick={handleCreateInvoice}
          >
            Save Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
        </>
    );
  },
});