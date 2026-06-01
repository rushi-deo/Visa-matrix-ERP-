import { createFileRoute } from "@tanstack/react-router";

import { ProfileDetailPage } from "@/components/profiles/ProfileDetailPage";

export const Route = createFileRoute("/_app/crm/customers/$id")({
  component: CustomerProfileRoute,
});

function CustomerProfileRoute() {
  const { id } = Route.useParams();

  return <ProfileDetailPage entity="customer" id={id} backTo="/crm/customers" backLabel="Customers" />;
}
