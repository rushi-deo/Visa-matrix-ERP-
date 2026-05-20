import { useEffect, useState } from "react";

import DataTable, { type TableColumn } from "../components/common/DataTable";
import LoadingState from "../components/common/LoadingState";
import SectionCard from "../components/common/SectionCard";
import type { CountryRecord } from "../types";
import { getCountries, type CountriesApiResponse } from "../services/api.js";
import { formatDateTime } from "../utils/formatters";

const columns: TableColumn<CountryRecord>[] = [
  {
    key: "name",
    header: "Country",
    render: (row) => String(row.name || row.country_name || row.title || row.id),
  },
  {
    key: "code",
    header: "Code",
    render: (row) => String(row.code || "N/A"),
  },
  {
    key: "region",
    header: "Region",
    render: (row) => String(row.region || "Global"),
  },
  {
    key: "created",
    header: "Created",
    render: (row) => formatDateTime(String(row.created_at || "")),
  },
];

export default function Countries() {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadCountries = async () => {
      try {
        const response = (await getCountries()) as CountriesApiResponse;

        if (!isActive) {
          return;
        }

        if (Array.isArray(response)) {
          setCountries(response);
          return;
        }

        if (response?.success === false) {
          console.error("Countries API error:", response.message || "Unable to load countries.");
          setCountries([]);
          return;
        }

        setCountries(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load countries:", error);

        if (isActive) {
          setCountries([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadCountries();

    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingState label="Loading country catalog..." />;
  }

  return (
    <SectionCard
      title="Countries"
      description="Backend country master data used for application creation and requirement mapping."
    >
      <DataTable
        columns={columns}
        rows={countries}
        emptyTitle="No countries found"
        emptyDescription="Country records returned by the backend will appear here."
      />
    </SectionCard>
  );
}
