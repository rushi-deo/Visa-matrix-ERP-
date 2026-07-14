import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/finance/expenses")({ component: () => {
  const cats = ["Travel","Office","Marketing","Software","Salaries","Utilities"];
  const data = Array.from({length: 14}).map((_, i) => ({ id: "x"+i, ref: "EXP-"+(100+i), category: cats[i%cats.length], date: "2025-11-"+((i%27)+1).toString().padStart(2,"0"), amount: 200+i*47, status: i%3===0 ? "Pending" : "Approved" }));
  const cols: Column<typeof data[number]>[] = [
    { key: "ref", header: "Ref" }, { key: "category", header: "Category" }, { key: "date", header: "Date" },
    { key: "amount", header: "Amount", render: (r) => `$${r.amount.toLocaleString()}` }, { key: "status", header: "Status" },
  ];
  return <ModulePage title="Expenses" data={data} columns={cols} searchKeys={["ref","category"]} primaryAction="Add Expense" />;
}});
