import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthFormCard from "./AuthFormCard";
import { useAuth } from "../../hooks/useAuth";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to sign in.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormCard
      eyebrow="Authentication"
      title="Sign in to Visa Matrix"
      description="Authenticate with your backend admin account to access case operations, analytics, and workflow controls."
      footerLabel="Need a new workspace account?"
      footerLinkText="Register"
      footerLinkTo="/register"
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
            placeholder="admin@visamatrix.com"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

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
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="text-right text-sm">
          <Link to="/forgot-password" className="font-medium text-[#1E5BB8]">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthFormCard>
  );
}
