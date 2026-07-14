import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { visaCategories } from "@/lib/mock-data";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/countries/categories")({ component: () => {
  const data = visaCategories.map((v) => ({ id: v.code, ...v }));
  const cols: Column<typeof data[number]>[] = [
    { key: "code", header: "Code" }, { key: "name", header: "Category", sortable: true }, { key: "duration", header: "Typical duration" },
  ];
  return <ModulePage title="Visa Categories" data={data} columns={cols} searchKeys={["name","code"]} primaryAction="Add Category" />;
}});
