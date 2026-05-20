import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import ErrorState from "../../components/common/ErrorState";
import SectionCard from "../../components/common/SectionCard";
import { APPLICATION_STATUSES } from "../../config/appConfig";
import { createApplication } from "../../services/applicationsService";
import { fetchVisaTypes } from "../../services/catalogService";
import { getCountries, type CountriesApiResponse } from "../../services/api.js";
import type { CountryRecord } from "../../types";

export default function CreateApplicationForm() {
  const visaTypesQuery = useQuery({
    queryKey: ["application-form-visa-types"],
    queryFn: fetchVisaTypes,
  });
  const [countries, setCountries] = useState<CountryRecord[]>([]);

  const [form, setForm] = useState({
    user_id: "",
    profile_id: "",
    country_id: "",
    visa_type: "",
    travel_date: "",
    status: "Submitted",
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCountries = async () => {
      try {
        const response = (await getCountries()) as CountriesApiResponse;

        if (!isActive) {
          return;
        }

        if (Array.isArray(response)) {
          setCountries(response);
          return;
        }

        if (response?.success === false) {
          console.error("Countries API error:", response.message || "Unable to load countries.");
          setCountries([]);
          return;
        }

        setCountries(Array.isArray(response?.data) ? response.data : []);
      } catch (countriesError) {
        console.error("Failed to load countries:", countriesError);

        if (isActive) {
          setCountries([]);
        }
      }
    };

    loadCountries();

    return () => {
      isActive = false;
    };
  }, []);

  const mutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      setError("");
      setFeedback("Application created successfully.");
      setForm({
        user_id: "",
        profile_id: "",
        country_id: "",
        visa_type: "",
        travel_date: "",
        status: "Submitted",
      });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create application.";
      setFeedback("");
      setError(message);
    },
  });

  if (visaTypesQuery.isError) {
    const message =
      (visaTypesQuery.error as Error | undefined)?.message ||
      "Unable to load catalog data.";
    return <ErrorState description={message} />;
  }

  return (
    <SectionCard
      title="Create application"
      description="Use the backend application endpoint to register a new visa case."
    >
      <form
        className="grid gap-5 lg:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback("");
          setError("");

          mutation.mutate({
            ...form,
            user_id: form.user_id || undefined,
            profile_id: form.profile_id || undefined,
            travel_date: form.travel_date || undefined,
          });
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            User ID
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={form.user_id}
            onChange={(event) =>
              setForm((current) => ({ ...current, user_id: event.target.value }))
            }
            placeholder="Optional if profile ID is provided"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Profile ID
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={form.profile_id}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                profile_id: event.target.value,
              }))
            }
            placeholder="Optional if user ID is provided"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Country
          </span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={form.country_id}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                country_id: event.target.value,
              }))
            }
            required
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.id} value={String(country.id)}>
                {String(country.name || country.country_name || country.title || country.id)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Visa type
          </span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={form.visa_type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                visa_type: event.target.value,
              }))
            }
            required
          >
            <option value="">Select visa type</option>
            {(visaTypesQuery.data || []).map((visaType, index) => (
              <option
                key={`${visaType.id || visaType.name || visaType.title || index}`}
                value={String(visaType.visa_type || visaType.name || visaType.title || "")}
              >
                {String(visaType.visa_type || visaType.name || visaType.title || "Unknown")}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Travel date
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            type="date"
            value={form.travel_date}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                travel_date: event.target.value,
              }))
            }
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({ ...current, status: event.target.value }))
            }
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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
            {mutation.isPending ? "Creating..." : "Create application"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
