import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DynamicVisaApplicationForm } from "@/components/forms/DynamicVisaApplicationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import apiClient, { API_ENDPOINTS, extractResponseData } from "@erp/services/apiClient";
import { fetchVisaCountries } from "@erp/services/api";

export const Route = createFileRoute("/_app/visa/applications/new")({ component: Page });

type Option = { id: string; name: string; flag?: string };
type FormConfig = any;

const items = (payload: any): any[] => Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
const normalizeCountries = (payload: any): Option[] => items(payload).map((item) => ({
  id: String(item.id ?? item.country_id ?? item.code ?? item.country_code ?? ""),
  name: String(item.name ?? item.country_name ?? item.country ?? item.title ?? ""),
  flag: item.flag ?? item.emoji,
})).filter((item) => item.id && item.name);
const normalizeVisaTypes = (payload: any): Option[] => items(payload).map((item) => ({
  id: String(item.id ?? item.visa_type_id ?? item.code ?? item.visa_code ?? ""),
  name: String(item.name ?? item.visa_name ?? item.visa_type ?? item.type ?? ""),
})).filter((item) => item.id && item.name);

function Page() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [countries, setCountries] = React.useState<Option[]>([]);
  const [visaTypes, setVisaTypes] = React.useState<Option[]>([]);
  const [country, setCountry] = React.useState("");
  const [visaType, setVisaType] = React.useState("");
  const [formConfig, setFormConfig] = React.useState<FormConfig | null>(null);
  const [applicationId, setApplicationId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingVisaTypes, setLoadingVisaTypes] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [applicant, setApplicant] = React.useState({ fullName: "", email: "", phone: "", passportNumber: "" });

  React.useEffect(() => {
    let mounted = true;
    fetchVisaCountries()
      .then((countryPayload) => {
        if (mounted) setCountries(normalizeCountries(countryPayload));
      })
      .catch((reason: any) => mounted && setError(reason?.message ?? "Unable to load application options."))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    setVisaType("");
    setVisaTypes([]);
    if (!country) {
      setLoadingVisaTypes(false);
      return () => { mounted = false; };
    }

    setLoadingVisaTypes(true);
    apiClient.get("/visa-types", { params: { country_id: country } })
      .then((response) => {
        if (mounted) setVisaTypes(normalizeVisaTypes(extractResponseData(response)));
      })
      .catch((reason: any) => mounted && setError(reason?.message ?? "Unable to load visa types."))
      .finally(() => mounted && setLoadingVisaTypes(false));

    return () => { mounted = false; };
  }, [country]);

  const ensureDraft = async () => {
    if (applicationId) return applicationId;
    const customerResponse = await apiClient.post("/customers", {
      full_name: applicant.fullName,
      email: applicant.email,
      phone: applicant.phone,
      passport_number: applicant.passportNumber,
    });
    const customer = extractResponseData(customerResponse);
    const customerId = String(customer?.id ?? customer?.customer_id ?? "");
    if (!customerId) throw new Error("Customer creation succeeded without an id.");
    const applicationResponse = await apiClient.post(API_ENDPOINTS.applications, {
      customer_id: customerId,
      country_id: country,
      visa_type_id: visaType,
      status: "draft",
    });
    const application = extractResponseData(applicationResponse);
    const id = String(application?.id ?? application?.application_id ?? "");
    if (!id) throw new Error("Application creation succeeded without an id.");
    setApplicationId(id);
    return id;
  };

  const continueToForm = async () => {
    if (!applicant.fullName || !applicant.email || !country || !visaType) {
      setError("Full name, email, country, and visa type are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await apiClient.get(`/forms/country/${country}/visa-type/${visaType}`);
      const config = extractResponseData(response) as FormConfig;
      if (!config?.form_schema?.sections?.length) throw new Error("No published application form was found for this selection.");
      await ensureDraft();
      setFormConfig(config);
      setStep(1);
    } catch (reason: any) {
      setError(reason?.response?.data?.message ?? reason?.message ?? "Unable to start the application.");
    } finally {
      setBusy(false);
    }
  };

  const saveDraft = async (values: Record<string, unknown>) => {
    setBusy(true);
    try {
      const id = await ensureDraft();
      window.localStorage.setItem(`visa-matrix:application-values:${id}`, JSON.stringify(values, (_, value) => value instanceof File ? { name: value.name, type: value.type } : value));
      toast.success("Application draft saved.");
    } catch (reason: any) {
      toast.error(reason?.message ?? "Unable to save draft.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (values: Record<string, unknown>) => {
    setBusy(true);
    try {
      const id = await ensureDraft();
      window.localStorage.setItem(`visa-matrix:application-values:${id}`, JSON.stringify(values, (_, value) => value instanceof File ? { name: value.name, type: value.type } : value));
      await apiClient.put(`${API_ENDPOINTS.applications}/${id}`, { status: "submitted" });
      toast.success("Application submitted.");
      navigate({ to: "/visa/applications" });
    } catch (reason: any) {
      toast.error(reason?.response?.data?.message ?? reason?.message ?? "Unable to submit application.");
    } finally {
      setBusy(false);
    }
  };

  return <>
    <PageHeader title="New Visa Application" description="Select the applicant, country, and visa type, then complete the published application form." />
    <div className="mb-6 flex items-center gap-2"><div className={`grid size-8 place-items-center rounded-full ${step === 0 ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground"}`}>{step > 0 ? <Check className="size-4" /> : 1}</div><span className={step === 0 ? "font-medium" : "text-muted-foreground"}>Application setup</span><div className="h-px w-8 bg-border" /><div className={`grid size-8 place-items-center rounded-full ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div><span className={step === 1 ? "font-medium" : "text-muted-foreground"}>Dynamic form</span></div>
    {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
    {step === 0 ? <Card><CardContent className="grid gap-4 p-6 sm:grid-cols-2">
      <div className="space-y-2"><Label>Full name *</Label><Input value={applicant.fullName} onChange={(event) => setApplicant((current) => ({ ...current, fullName: event.target.value }))} /></div>
      <div className="space-y-2"><Label>Email *</Label><Input type="email" value={applicant.email} onChange={(event) => setApplicant((current) => ({ ...current, email: event.target.value }))} /></div>
      <div className="space-y-2"><Label>Phone</Label><Input value={applicant.phone} onChange={(event) => setApplicant((current) => ({ ...current, phone: event.target.value }))} /></div>
      <div className="space-y-2"><Label>Passport number</Label><Input value={applicant.passportNumber} onChange={(event) => setApplicant((current) => ({ ...current, passportNumber: event.target.value }))} /></div>
      <div className="space-y-2"><Label>Country *</Label><Select value={country} onValueChange={setCountry} disabled={loading}><SelectTrigger><SelectValue placeholder={loading ? "Loading countries..." : "Select country"} /></SelectTrigger><SelectContent>{countries.map((item) => <SelectItem key={item.id} value={item.id}>{item.flag ? `${item.flag} ` : ""}{item.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Visa type *</Label><Select value={visaType} onValueChange={setVisaType} disabled={!country || loadingVisaTypes}><SelectTrigger><SelectValue placeholder={loadingVisaTypes ? "Loading visa types..." : !country ? "Select country first" : "Select visa type"} /></SelectTrigger><SelectContent>{visaTypes.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex justify-end pt-2 sm:col-span-2"><Button onClick={continueToForm} disabled={busy || loading}>{busy ? "Loading form..." : "Continue to application form"}</Button></div>
    </CardContent></Card> : formConfig ? <DynamicVisaApplicationForm config={formConfig} countryName={country} visaTypeName={visaType} onSaveDraft={saveDraft} onSubmit={submit} /> : null}
  </>;
}
