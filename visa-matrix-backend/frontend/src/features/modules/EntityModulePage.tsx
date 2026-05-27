import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import DataTable, { type TableColumn } from "../../components/common/DataTable";
import ErrorState from "../../components/common/ErrorState";
import LoadingState from "../../components/common/LoadingState";
import SectionCard from "../../components/common/SectionCard";
import StatusPill from "../../components/common/StatusPill";
import { fetchResourceCollection } from "../../services/resourceService";
import type { ResourceItem } from "../../types";
import { formatDateTime, toTitleCase } from "../../utils/formatters";
import { moduleConfigs, type ModuleConfigKey } from "./moduleConfigs";

type EntityModulePageProps = {
  moduleKey: ModuleConfigKey;
};

function renderValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "Not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-US");
  }

  return String(value);
}

export default function EntityModulePage({ moduleKey }: EntityModulePageProps) {
  const config = moduleConfigs[moduleKey];
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["resource-module", config.endpoint],
    queryFn: () => fetchResourceCollection(config.endpoint),
    retry: 0,
  });

  if (query.isLoading) {
    return <LoadingState label={`Loading ${config.title.toLowerCase()}...`} />;
  }

  if (query.isError) {
    const errorMessage =
      query.error instanceof Error
        ? query.error.message
        : "Backend endpoint unavailable.";

    return (
      <div className="space-y-6">
        <SectionCard title={config.title} description={config.description}>
          <ErrorState
            title="Backend endpoint not yet available"
            description={`${config.helperText} Current response: ${errorMessage}`}
          />
        </SectionCard>
      </div>
    );
  }

  const data = query.data ?? { items: [] };
  const rows = data.items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const columns: TableColumn<ResourceItem>[] = config.columns.map((column) => ({
    key: column.key,
    header: column.header,
    render: (row) => {
      const value = row[column.key];

      if (column.key.includes("status")) {
        return <StatusPill value={String(value || "Pending")} />;
      }

      if (column.key.includes("created") || column.key.includes("updated")) {
        return formatDateTime(String(value || ""));
      }

      return toTitleCase(String(renderValue(value)));
    },
  }));

  return (
    <div className="space-y-6">
      <SectionCard title={config.title} description={config.description}>
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-premium-silver-200/70 bg-premium-navy-950/5 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-premium-blue-200">
              Backend endpoint
            </p>
            <p className="mt-3 text-lg font-semibold text-premium-navy-950">
              {config.endpoint}
            </p>
            <p className="mt-3 text-sm leading-6 text-premium-silver-500">
              {config.helperText}
            </p>
          </div>
          <label className="block rounded-3xl border border-premium-silver-200/70 bg-premium-platinum-100 p-5 shadow-sm">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-premium-blue-200">
              Search records
            </span>
            <input
              className="w-full rounded-2xl border border-premium-silver-200 bg-white px-4 py-3 text-premium-navy-950 outline-none transition focus:border-premium-blue-400 focus:ring-premium"
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle={`No ${config.title.toLowerCase()} found`}
          emptyDescription={`When the backend returns data for ${config.endpoint}, records will render here.`}
        />
      </SectionCard>
    </div>
  );
}
