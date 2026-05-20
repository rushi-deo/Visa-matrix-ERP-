import EntityModulePage from "../features/modules/EntityModulePage";
import PaymentForm from "../features/payments/PaymentForm";

export default function Payments() {
  return (
    <div className="space-y-6">
      <PaymentForm />
      <EntityModulePage moduleKey="transactions" />
    </div>
  );
}
