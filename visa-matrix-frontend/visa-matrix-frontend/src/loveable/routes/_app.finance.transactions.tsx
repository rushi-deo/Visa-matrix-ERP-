import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
import { fetchPayments } from "@erp/services/payments.service";

type Transaction = { id: string; invoiceNo: string; customer: string; amount: number; status: string };

export const Route = createFileRoute("/_app/finance/transactions")({
  component: Page,
});

function Page() {
  const [data, setData] = useState<Transaction[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchPayments().then((rows) => {
      if (mounted) setData(rows as Transaction[]);
    }).catch(() => mounted && setData([]));
    return () => {
      mounted = false;
    };
  }, []);

  const cols: Column<Transaction>[] = [
    { key: "invoiceNo", header: "Invoice" },
    { key: "customer", header: "Customer" },
    { key: "amount", header: "Amount", render: (r) => `$${r.amount.toLocaleString()}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return <ModulePage title="Transactions" data={data} columns={cols} searchKeys={["invoiceNo", "customer"]} primaryAction="New Transaction" />;
}
