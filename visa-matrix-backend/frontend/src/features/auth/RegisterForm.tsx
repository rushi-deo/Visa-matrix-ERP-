import { useState } from "react";

import AuthFormCard from "./AuthFormCard";
import type { FrontendRole } from "../../types";
import { useAuth } from "../../hooks/useAuth";

const roles: FrontendRole[] = ["admin", "manager", "agent", "customer"];

export default function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "admin" as FrontendRole,
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");
    setSubmitting(true);

    try {
      await register(form);
      setFeedback("Account created successfully. You can now sign in.");
      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "admin",
      });
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to register.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormCard
      eyebrow="Onboarding"
      title="Create a Visa Matrix account"
      description="Use this registration flow when your backend exposes self-service or invited-user account creation."
      footerLabel="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Full name
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={form.full_name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                full_name: event.target.value,
              }))
            }
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Role
          </span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as FrontendRole,
              }))
            }
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
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
          {submitting ? "Submitting..." : "Create account"}
        </button>
      </form>
    </AuthFormCard>
  );
}
