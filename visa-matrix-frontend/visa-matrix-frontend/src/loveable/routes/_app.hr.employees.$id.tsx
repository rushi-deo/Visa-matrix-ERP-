import { createFileRoute } from "@tanstack/react-router";

import { ProfileDetailPage } from "@/components/profiles/ProfileDetailPage";

export const Route = createFileRoute("/_app/hr/employees/$id")({
  component: EmployeeProfileRoute,
});

function EmployeeProfileRoute() {
  const { id } = Route.useParams();

  return <ProfileDetailPage entity="employee" id={id} backTo="/hr/employees" backLabel="Employees" />;
}
