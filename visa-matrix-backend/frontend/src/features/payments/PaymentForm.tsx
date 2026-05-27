import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import SectionCard from "../../components/common/SectionCard";
import { createPayment } from "../../services/paymentsService";

export default function PaymentForm() {
  const [form, setForm] = useState({
    application_id: "",
    amount: 0,
    currency: "USD",
    payment_status: "pending",
    provider_ref: "",
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      setFeedback("Payment created successfully.");
      setError("");
      setForm({
        application_id: "",
        amount: 0,
        currency: "USD",
        payment_status: "pending",
        provider_ref: "",
      });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create payment.";
      setFeedback("");
      setError(message);
    },
  });

  return (
    <SectionCard
      title="Capture payment"
      description="Post payment records to the backend payments endpoint for invoice and revenue workflows."
    >
      <form
        className="grid gap-5 lg:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback("");
          setError("");
          mutation.mutate(form);
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-premium-silver-300">
            Application ID
          </span>
          <input
            className="w-full rounded-2xl border border-premium-blue-500/20 bg-premium-navy-950/10 px-4 py-3 text-white outline-none transition focus:border-premium-blue-300 focus:ring-premium focus:ring-opacity-70"
            value={form.application_id}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                application_id: event.target.value,
              }))
            }
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-premium-silver-300">
            Amount
          </span>
          <input
            className="w-full rounded-2xl border border-premium-blue-500/20 bg-premium-navy-950/10 px-4 py-3 text-white outline-none transition focus:border-premium-blue-300 focus:ring-premium focus:ring-opacity-70"
            type="number"
            min="1"
            step="0.01"
            value={form.amount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                amount: Number(event.target.value),
              }))
            }
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-premium-silver-300">
            Currency
          </span>
          <input
            className="w-full rounded-2xl border border-premium-blue-500/20 bg-premium-navy-950/10 px-4 py-3 text-white outline-none transition focus:border-premium-blue-300 focus:ring-premium focus:ring-opacity-70"
            value={form.currency}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currency: event.target.value.toUpperCase(),
              }))
            }
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-premium-silver-300">
            Payment status
          </span>
          <select
            className="w-full rounded-2xl border border-premium-blue-500/20 bg-premium-navy-950/10 px-4 py-3 text-white outline-none transition focus:border-premium-blue-300 focus:ring-premium focus:ring-opacity-70"
            value={form.payment_status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                payment_status: event.target.value,
              }))
            }
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-2 block text-sm font-medium text-premium-silver-300">
            Provider reference
          </span>
          <input
            className="w-full rounded-2xl border border-premium-blue-500/20 bg-premium-navy-950/10 px-4 py-3 text-white outline-none transition focus:border-premium-blue-300 focus:ring-premium focus:ring-opacity-70"
            value={form.provider_ref}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                provider_ref: event.target.value,
              }))
            }
          />
        </label>

        <div className="lg:col-span-2">
          {feedback ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedback}
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            className="rounded-2xl bg-[#1E5BB8] px-5 py-3 text-sm font-semibold text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Create payment"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
