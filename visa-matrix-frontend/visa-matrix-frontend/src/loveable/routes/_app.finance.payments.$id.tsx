import { createFileRoute } from "@tanstack/react-router";

import { ProfileDetailPage } from "@/components/profiles/ProfileDetailPage";

export const Route = createFileRoute("/_app/finance/payments/$id")({
  component: PaymentDetailRoute,
});

function PaymentDetailRoute() {
  const { id } = Route.useParams();

  return <ProfileDetailPage entity="payment" id={id} backTo="/finance/payments" backLabel="Payments" />;
}
