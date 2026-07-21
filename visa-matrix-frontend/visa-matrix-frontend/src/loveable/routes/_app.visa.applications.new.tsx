import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicVisaApplicationForm } from "@/components/forms/DynamicVisaApplicationForm";
import apiClient, { extractResponseData } from "@erp/services/apiClient";

export const Route = createFileRoute("/_app/visa/applications/new")({ component: Page });

type LookupItem = { id: string; name: string };
type FormConfig = { form_schema?: { sections?: any[] }; name?: string; country_name?: string; visa_type_name?: string };

const collection = (payload: unknown) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray((payload as { items?: unknown[] })?.items)) return (payload as { items: unknown[] }).items;
  if (Array.isArray((payload as { data?: unknown[] })?.data)) return (payload as { data: unknown[] }).data;
  return [];
};

const normalizeLookup = (item: any): LookupItem => ({
  id: String(item?.id ?? item?.country_id ?? item?.visa_type_id ?? item?.code ?? ""),
  name: String(item?.name ?? item?.country_name ?? item?.visa_name ?? item?.visa_type ?? item?.title ?? ""),
});

function Page() {
  const [countries, setCountries] = React.useState<LookupItem[]>([]);
  const [visaTypes, setVisaTypes] = React.useState<LookupItem[]>([]);
  const [countryId, setCountryId] = React.useState("");
  const [visaTypeId, setVisaTypeId] = React.useState("");
  const [config, setConfig] = React.useState<FormConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingForm, setLoadingForm] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    apiClient.get("/countries").then((response) => {
      if (active) setCountries(collection(extractResponseData(response)).map(normalizeLookup).filter((item) => item.id && item.name));
    }).catch(() => active && setError("Unable to load countries."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    setVisaTypeId("");
    setVisaTypes([]);
    setConfig(null);
    if (!countryId) return undefined;
    apiClient.get("/visa-types", { params: { country_id: countryId } }).then((response) => {
      if (active) setVisaTypes(collection(extractResponseData(response)).map(normalizeLookup).filter((item) => item.id && item.name));
    }).catch(() => active && setError("Unable to load visa types."));
    return () => { active = false; };
  }, [countryId]);

  const loadForm = async () => {
    if (!countryId || !visaTypeId) return;
    setLoadingForm(true);
    setError("");
    try {
      const response = await apiClient.get(`/forms/country/${countryId}/visa-type/${visaTypeId}`);
      const nextConfig = extractResponseData(response) as FormConfig;
      if (!nextConfig?.form_schema?.sections?.length) throw new Error("No form sections are configured for this visa type.");
      setConfig(nextConfig);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message ?? loadError?.message ?? "Unable to load the visa application form.");
    } finally {
      setLoadingForm(false);
    }
  };

  const selectedCountry = countries.find((item) => item.id === countryId);
  const selectedVisaType = visaTypes.find((item) => item.id === visaTypeId);

  return <>
    <PageHeader title="New Visa Application" description="Complete the application one section at a time." />
    {!config && <Card className="mb-6 border-border/80 shadow-sm"><CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="space-y-2 text-sm font-medium">Country<select value={countryId} onChange={(event) => setCountryId(event.target.value)} disabled={loading} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal"><option value="">Select country</option>{countries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium">Visa type<select value={visaTypeId} onChange={(event) => setVisaTypeId(event.target.value)} disabled={!countryId || !visaTypes.length} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal"><option value="">{countryId ? "Select visa type" : "Select a country first"}</option>{visaTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <Button type="button" onClick={loadForm} disabled={!countryId || !visaTypeId || loadingForm}>{loadingForm && <Loader2 className="size-4 animate-spin" />}{loadingForm ? "Loading..." : "Start application"}</Button>
    </CardContent></Card>}
    {error && <div className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div>}
    {config && <DynamicVisaApplicationForm config={config} countryName={selectedCountry?.name ?? config.country_name} visaTypeName={selectedVisaType?.name ?? config.visa_type_name} />}
  </>;
}
