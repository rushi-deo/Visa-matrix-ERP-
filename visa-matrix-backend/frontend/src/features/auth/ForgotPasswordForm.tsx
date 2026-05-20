import { useState } from "react";

import AuthFormCard from "./AuthFormCard";
import { useAuth } from "../../hooks/useAuth";

export default function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError("");
    setSubmitting(true);

    try {
      await forgotPassword(email);
      setFeedback("Password recovery request sent successfully.");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to request a password reset.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormCard
      eyebrow="Recovery"
      title="Reset your password"
      description="Trigger the backend password recovery workflow and deliver recovery instructions to the selected account."
      footerLabel="Remembered your password?"
      footerLinkText="Back to sign in"
      footerLinkTo="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {feedback ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-2xl bg-[#1E5BB8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174B98]"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthFormCard>
  );
}
