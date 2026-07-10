import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { ModulePage } from "@/components/common/ModulePage";
import type { Column } from "@/components/common/DataTable";
import { fetchVisaCountries } from "@erp/services/api";
export const Route = createFileRoute("/_app/countries")({ component: () => {
  const [data, setData] = React.useState<Array<{ id: string; name: string; code: string; embassy?: string; processing?: string; flag?: string }>>([]);
  React.useEffect(() => {
    let mounted = true;
    fetchVisaCountries()
      .then((countries) => {
        if (!mounted) return;
        setData(
          countries.map((country) => ({
            id: country.id ?? country.code ?? country.name,
            name: country.name ?? "",
            code: country.code ?? "",
            embassy: country.embassy ?? "",
            processing: country.processing_time ?? country.processingTime ?? "",
            flag: country.flag ?? "",
          })),
        );
      })
      .catch(() => {
        if (mounted) setData([]);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const cols: Column<typeof data[number]>[] = [
    { key: "flag", header: "", className: "w-12" }, { key: "name", header: "Country", sortable: true },
    { key: "code", header: "Code" }, { key: "embassy", header: "Embassy" }, { key: "processing", header: "Processing time" },
  ];
  return <ModulePage title="Countries & Embassy Rules" description="Manage countries, requirements and processing times." data={data} columns={cols} searchKeys={["name","code","embassy"]} primaryAction="Add Country" />;
}}); 
