import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { invoices } from "@/lib/mock-data";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/finance/transactions")({ component: () => {
  const data = invoices.map((i) => ({ id: i.id, ref: "TXN-"+i.invoiceNo.slice(4), party: i.customer, date: i.issued, type: ["Credit","Debit"][Math.random()>0.5?1:0], amount: i.amount }));
  const cols: Column<typeof data[number]>[] = [
    { key: "ref", header: "Reference" }, { key: "party", header: "Party" }, { key: "date", header: "Date" },
    { key: "type", header: "Type" }, { key: "amount", header: "Amount", render: (r) => `$${r.amount.toLocaleString()}` },
  ];
  return <ModulePage title="Transactions" data={data} columns={cols} searchKeys={["ref","party"]} primaryAction="Add Entry" />;
}});
