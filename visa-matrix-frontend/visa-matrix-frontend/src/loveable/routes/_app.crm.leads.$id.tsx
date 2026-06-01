import { createFileRoute } from "@tanstack/react-router";

import { ProfileDetailPage } from "@/components/profiles/ProfileDetailPage";

export const Route = createFileRoute("/_app/crm/leads/$id")({
  component: LeadProfileRoute,
});

function LeadProfileRoute() {
  const { id } = Route.useParams();

  return <ProfileDetailPage entity="lead" id={id} backTo="/crm/leads" backLabel="Leads" />;
}
