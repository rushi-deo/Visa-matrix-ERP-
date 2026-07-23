import * as React from "react";
import { Download, Eye, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { fetchPayments } from "@erp/services/payments.service";

interface ApplicantPaymentsProps {
  applicant: any;
  applicationId: string;
}

const firstValue = (source: any, keys: string[]) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") return source[key];
  }
  return null;
};

const numberValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const money = (value: number | null) =>
  value === null ? "-" : value.toLocaleString(undefined, { style: "currency", currency: "USD" });

const getReceiptUrl = (payment: any) =>
  firstValue(payment, ["receiptUrl", "receipt_url", "receiptPdf", "receipt_pdf", "receiptUrl"]);

export function ApplicantPayments({ applicant, applicationId }: ApplicantPaymentsProps) {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchPayments()
      .then((rows) => {
        if (!mounted) return;
        const applicationKeys = new Set(
          [applicationId, applicant?.id, applicant?.applicationCode, applicant?.application_number]
            .filter(Boolean)
            .map(String),
        );
        setPayments(
          (Array.isArray(rows) ? rows : []).filter((payment) =>
            applicationKeys.has(String(payment.application ?? payment.application_id ?? "")),
          ),
        );
      })
      .catch(() => {
        if (mounted) setPayments([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [applicant, applicationId]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading payments...</p>;
  if (payments.length === 0) return <p className="text-sm text-muted-foreground">No payment records found.</p>;

  const totalVisaFee = numberValue(firstValue(applicant, ["totalVisaFee", "total_visa_fee", "visaFee", "visa_fee"]));
  const serviceFee = numberValue(firstValue(applicant, ["serviceFee", "service_fee"]));
  const additionalCharges = numberValue(firstValue(applicant, ["additionalCharges", "additional_charges"]));
  const invoiceTotal = payments.reduce((total, payment) => total + (numberValue(payment.amount) ?? 0), 0);
  const totalAmount = numberValue(firstValue(applicant, ["totalAmount", "total_amount", "amount"])) ?? invoiceTotal;
  const amountPaid = numberValue(firstValue(applicant, ["amountPaid", "amount_paid", "paidAmount", "paid_amount"])) ?? payments.reduce((total, payment) => /paid/i.test(String(payment.status ?? payment.paymentStatus ?? "")) ? total + (numberValue(payment.amount) ?? 0) : total, 0);
  const pendingBalance = Math.max(0, totalAmount - amountPaid);
  const paymentStatus = firstValue(applicant, ["paymentStatus", "payment_status"]) ?? (pendingBalance === 0 ? "Paid" : "Pending");

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Visa Fee", money(totalVisaFee ?? (serviceFee === null && additionalCharges === null ? totalAmount : null))],
          ["Service Fee", money(serviceFee)],
          ["Additional Charges", money(additionalCharges)],
          ["Total Amount", money(totalAmount)],
          ["Amount Paid", money(amountPaid)],
          ["Pending Balance", money(pendingBalance)],
          ["Payment Status", <StatusBadge value={String(paymentStatus)} />],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
              <div className="mt-2 text-lg font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Receipt className="size-4" />Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y bg-muted/30 text-xs text-muted-foreground">
                <tr>
                  {['Date', 'Amount', 'Payment Method', 'Receipt Number', 'Status', ''].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 font-medium">{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => {
                  const receiptUrl = getReceiptUrl(payment);
                  const receiptNumber = firstValue(payment, ["receiptNumber", "receipt_number", "receiptId", "receipt_id", "invoiceNo"]) ?? "-";
                  const fileName = payment.receiptFileName ?? payment.receipt_file_name ?? receiptNumber;
                  return (
                    <tr key={payment.invoiceId ?? payment.id ?? receiptNumber}>
                      <td className="whitespace-nowrap px-4 py-3">{firstValue(payment, ["paidOn", "paid_on", "invoiceDate", "invoice_date", "issued"]) ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{money(numberValue(payment.amount))}</td>
                      <td className="px-4 py-3">{firstValue(payment, ["paymentMethod", "payment_method"]) ?? "-"}</td>
                      <td className="px-4 py-3">{receiptNumber}</td>
                      <td className="px-4 py-3"><StatusBadge value={String(payment.status ?? payment.paymentStatus ?? "Pending")} /></td>
                      <td className="px-4 py-3"><div className="flex gap-2">{receiptUrl ? <><Button asChild size="sm" variant="outline"><a href={receiptUrl} target="_blank" rel="noreferrer"><Eye className="size-3.5" />View Receipt</a></Button><Button asChild size="sm" variant="outline"><a href={receiptUrl} download={fileName || true}><Download className="size-3.5" />Download</a></Button></> : null}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
