import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { countries } from "@/lib/mock-data";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/countries")({ component: () => {
  const data = countries.map((c) => ({ id: c.code, ...c }));
  const cols: Column<typeof data[number]>[] = [
    { key: "flag", header: "", className: "w-12" }, { key: "name", header: "Country", sortable: true },
    { key: "code", header: "Code" }, { key: "embassy", header: "Embassy" }, { key: "processing", header: "Processing time" },
  ];
  return <ModulePage title="Countries & Embassy Rules" description="Manage countries, requirements and processing times." data={data} columns={cols} searchKeys={["name","code","embassy"]} primaryAction="Add Country" />;
}});
