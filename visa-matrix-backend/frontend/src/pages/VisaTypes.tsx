import { useQuery } from "@tanstack/react-query";

import DataTable, { type TableColumn } from "../components/common/DataTable";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import SectionCard from "../components/common/SectionCard";
import { fetchVisaTypes } from "../services/catalogService";
import type { VisaTypeRecord } from "../types";

const columns: TableColumn<VisaTypeRecord>[] = [
  {
    key: "name",
    header: "Visa Type",
    render: (row) => String(row.visa_type || row.name || row.title || "Unknown"),
  },
  {
    key: "processing",
    header: "Processing Time",
    render: (row) => String(row.processing_time || "Pending"),
  },
  {
    key: "id",
    header: "ID",
    render: (row) => String(row.id || "N/A"),
  },
];

export default function VisaTypes() {
  const query = useQuery({
    queryKey: ["visa-types"],
    queryFn: fetchVisaTypes,
  });

  if (query.isLoading) {
    return <LoadingState label="Loading visa types..." />;
  }

  if (query.isError) {
    const message =
      query.error instanceof Error
        ? query.error.message
        : "Unable to load visa types.";
    return <ErrorState description={message} />;
  }

  return (
    <SectionCard
      title="Visa types"
      description="Backend visa type catalog used by application intake and eligibility rules."
    >
      <DataTable
        columns={columns}
        rows={query.data || []}
        emptyTitle="No visa types found"
        emptyDescription="Visa type records returned by the backend will appear here."
      />
    </SectionCard>
  );
}
