import { createFileRoute } from "@tanstack/react-router";

import { ProfileDetailPage } from "@/components/profiles/ProfileDetailPage";

export const Route = createFileRoute("/_app/finance/invoices/$id")({
  component: InvoiceDetailRoute,
});

function InvoiceDetailRoute() {
  const { id } = Route.useParams();

  return <ProfileDetailPage entity="invoice" id={id} backTo="/finance/invoices" backLabel="Invoices" />;
}
