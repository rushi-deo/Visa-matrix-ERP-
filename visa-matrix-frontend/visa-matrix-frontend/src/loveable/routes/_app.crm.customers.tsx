import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import CustomerCreateDialog from "@/components/customers/CustomerCreateDialog";
import type { Column } from "@/components/common/DataTable";
import apiClient, { extractResponseData } from "@erp/services/apiClient";
import { toast } from "sonner";

type BackendCustomer = {
  id?: string | number;
  customer_id?: string | number;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  country?: string;
  status?: string;
  stage?: string;
  value?: number;
  ltv?: number;
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  value: number;
  stage: string;
};

const unwrapCustomers = (payload: unknown): BackendCustomer[] => {
  if (Array.isArray(payload)) {
    return payload as BackendCustomer[];
  }

  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const record = payload as {
    items?: unknown;
    customers?: unknown;
    data?: unknown;
  };

  if (Array.isArray(record.items)) {
    return record.items as BackendCustomer[];
  }

  if (Array.isArray(record.customers)) {
    return record.customers as BackendCustomer[];
  }

  if (Array.isArray(record.data)) {
    return record.data as BackendCustomer[];
  }

  return [];
};

const toCustomerRow = (customer: BackendCustomer, index: number): CustomerRow => ({
  id: String(customer.id ?? customer.customer_id ?? `customer-${index}`),
  name: customer.full_name ?? customer.name ?? "Unnamed customer",
  email: customer.email ?? "",
  phone: customer.phone ?? "",
  country: customer.nationality ?? customer.country ?? "",
  value: Number(customer.value ?? customer.ltv ?? 0),
  stage: customer.status ?? customer.stage ?? "Active",
});

export const Route = createFileRoute("/_app/crm/customers")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<CustomerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadCustomers = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await apiClient.get("/customers");
      const customers = unwrapCustomers(extractResponseData(response));
      setData(customers.map(toCustomerRow));
    } catch (error) {
      console.error("Failed to load customers:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load customers";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const cols: Column<CustomerRow>[] = [
    { key: "name", header: "Customer" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "country", header: "Country" },
    {
      key: "value",
      header: "LTV",
      render: (row) => `$${row.value.toLocaleString()}`,
    },
    {
      key: "stage",
      header: "Status",
      render: (row) => <StatusBadge value={row.stage} />,
    },
  ];

  return (
    <>
      <ModulePage
        title="Customers"
        description={
          loadError
            ? loadError
            : loading
              ? "Loading customers..."
              : undefined
        }
        data={data}
        columns={cols}
        searchKeys={["name", "email", "country"]}
        primaryAction="Add Customer"
        onPrimaryAction={() => setOpen(true)}
        onRowClick={(row) =>
          navigate({
            to: "/crm/customers/$id",
            params: { id: row.id },
          })
        }
      />
      <CustomerCreateDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={async () => {
          await loadCustomers();
        }}
      />
    </>
  );
}
