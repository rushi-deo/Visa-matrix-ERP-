import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as React from "react";
import apiClient, { API_ENDPOINTS } from "@erp/services/apiClient";
import { fetchVisaCountries } from "@erp/services/api";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export const Route = createFileRoute("/_app/visa/applications/new")({
  component: Page,
});
const steps = ["Applicant", "Visa Details", "Documents", "Review"];
const visaCategories = [
  { code: "TOURIST", name: "Tourist Visa", duration: "30-90 days" },
  { code: "BUSINESS", name: "Business Visa", duration: "30-180 days" },
  { code: "STUDENT", name: "Student Visa", duration: "1-4 years" },
  { code: "WORK", name: "Work Permit", duration: "1-3 years" },
  { code: "PR", name: "Permanent Residency", duration: "Permanent" },
  { code: "TRANSIT", name: "Transit Visa", duration: "1-3 days" },
];

type CountryOption = {
  id: string;
  name: string;
  flag?: string;
};

const normalizeCountries = (payload: unknown): CountryOption[] => {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.items)
      ? (payload as any).items
      : [];

  return items
    .map((item: any) => {
      const id = String(item?.id ?? item?.country_id ?? item?.code ?? item?.country_code ?? "");
      const name = String(item?.name ?? item?.country_name ?? item?.country ?? item?.title ?? "");
      const flag = item?.flag ?? item?.flag_image ?? item?.emoji;

      return {
        id,
        name,
        flag: flag ? String(flag) : undefined,
      };
    })
    .filter((item) => item.id && item.name);
};

const normalizeVisaTypes = (payload: unknown): CountryOption[] => {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.items)
      ? (payload as any).items
      : Array.isArray((payload as any)?.data)
        ? (payload as any).data
        : [];

  return items
    .map((item: any) => {
      const id = String(item?.id ?? item?.visa_type_id ?? item?.code ?? item?.visa_code ?? "");
      const name = String(item?.name ?? item?.visa_name ?? item?.visa_type ?? item?.type ?? "");

      return {
        id,
        name,
      };
    })
    .filter((item) => item.id && item.name);
};

function Page() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [countries, setCountries] = React.useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = React.useState(true);
  const [countriesError, setCountriesError] = React.useState<string | null>(null);
  const [visaTypes, setVisaTypes] = React.useState<CountryOption[]>([]);
  const [loadingVisaTypes, setLoadingVisaTypes] = React.useState(true);
  const [visaTypesError, setVisaTypesError] = React.useState<string | null>(null);

  // form state
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [passportNumber, setPassportNumber] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [visaType, setVisaType] = React.useState("");
  const [travelDate, setTravelDate] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState("");
  const [purpose, setPurpose] = React.useState("");

  const formRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadCountries = async () => {
      setLoadingCountries(true);
      setCountriesError(null);

      try {
        const data = await fetchVisaCountries();
        const nextCountries = normalizeCountries(data);

        if (mounted) {
          setCountries(nextCountries);
        }
      } catch (loadError: any) {
        if (mounted) {
          setCountries([]);
          setCountriesError(loadError?.message ?? "Failed to load countries.");
        }
      } finally {
        if (mounted) {
          setLoadingCountries(false);
        }
      }
    };

    const loadVisaTypes = async () => {
      setLoadingVisaTypes(true);
      setVisaTypesError(null);

      try {
        const response = await apiClient.get("/visa-types");
        const nextVisaTypes = normalizeVisaTypes(response?.data ?? response);

        if (mounted) {
          setVisaTypes(nextVisaTypes);
        }
      } catch (loadError: any) {
        if (mounted) {
          setVisaTypes([]);
          setVisaTypesError(loadError?.message ?? "Failed to load visa types.");
        }
      } finally {
        if (mounted) {
          setLoadingVisaTypes(false);
        }
      }
    };

    loadCountries();
    loadVisaTypes();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="New Visa Application"
        description="Multi-step intake — saves automatically."
      />
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "size-8 rounded-full grid place-items-center text-sm font-medium",
                i < step
                  ? "bg-success text-success-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm whitespace-nowrap",
                i === step ? "font-medium" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className="w-8 h-px bg-border mx-1" />
            )}
          </div>
        ))}
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          {step === 0 && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passport number</Label>
                  <Input
                    name="passportNumber"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={country}
                    onValueChange={setCountry}
                    disabled={loadingCountries}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingCountries
                            ? "Loading countries..."
                            : countriesError
                              ? "Unable to load countries"
                              : countries.length === 0
                                ? "No countries available"
                                : "Select country"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCountries && (
                        <SelectItem value="__loading" disabled>
                          Loading countries...
                        </SelectItem>
                      )}
                      {!loadingCountries && countriesError && (
                        <SelectItem value="__error" disabled>
                          {countriesError}
                        </SelectItem>
                      )}
                      {!loadingCountries && !countriesError && countries.length === 0 && (
                        <SelectItem value="__empty" disabled>
                          No countries available
                        </SelectItem>
                      )}
                      {countries.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.flag ? `${c.flag} ` : ""}
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visa Type</Label>
                  <Select
                    value={visaType}
                    onValueChange={setVisaType}
                    disabled={loadingVisaTypes}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingVisaTypes
                            ? "Loading visa types..."
                            : visaTypesError
                              ? "Unable to load visa types"
                              : visaTypes.length === 0
                                ? "No visa types available"
                                : "Select visa type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingVisaTypes && (
                        <SelectItem value="__loading" disabled>
                          Loading visa types...
                        </SelectItem>
                      )}
                      {!loadingVisaTypes && visaTypesError && (
                        <SelectItem value="__error" disabled>
                          {visaTypesError}
                        </SelectItem>
                      )}
                      {!loadingVisaTypes && !visaTypesError && visaTypes.length === 0 && (
                        <SelectItem value="__empty" disabled>
                          No visa types available
                        </SelectItem>
                      )}
                      {visaTypes.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Travel date</Label>
                  <Input
                    type="date"
                    name="travelDate"
                    value={travelDate ?? ""}
                    onChange={(e) => setTravelDate(e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration of stay</Label>
                  <Input
                    name="duration"
                    placeholder="e.g. 30 days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Purpose</Label>
                  <Textarea
                    name="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Required documents:
              </p>
              <ul className="space-y-2">
                {[
                  "Passport copy",
                  "Photo (2x2)",
                  "Bank statement (3 months)",
                  "Employment letter",
                  "Travel itinerary",
                ].map((d) => (
                  <li
                    key={d}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <span className="text-sm">{d}</span>
                    <Button variant="outline" size="sm">
                      Upload
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {step === 3 && (
            <div className="space-y-2">
              <p className="text-sm">
                Review and submit your application. You'll be notified at every
                status change.
              </p>
              <div className="rounded-md bg-muted p-4 text-sm">
                All sections look good. Ready to submit.
              </div>
            </div>
          )}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Continue</Button>
            ) : (
              <Button
                onClick={async () => {
                  setError(null);
                  setSubmitting(true);
                  try {
                    if (!country) {
                      throw new Error("Please select a country.");
                    }
                    if (!visaType) {
                      throw new Error("Please select a visa type.");
                    }

                    const customerPayload = {
                      full_name: fullName,
                      email,
                      phone,
                      passport_number: passportNumber,
                    };

                    console.log("CUSTOMER PAYLOAD", customerPayload);

                    const customerResp = await apiClient.post(
                      "/customers",
                      customerPayload,
                    );

                    console.log("CUSTOMER RESPONSE", customerResp);

                    const customerData =
                      customerResp?.data?.data ?? customerResp?.data ?? customerResp;
                    const customerId = String(
                      customerData?.id ?? customerData?.customer_id ?? "",
                    );

                    if (!customerId) {
                      throw new Error("Customer creation succeeded without an id.");
                    }

                    const applicationPayload = {
                      customer_id: customerId,
                      country_id: country,
                      visa_type_id: visaType,
                      travel_date: travelDate || null,
                    };

                    console.log("APPLICATION PAYLOAD", applicationPayload);

                    await apiClient.post(API_ENDPOINTS.applications, applicationPayload);

                    toast.success("Application created");
                    navigate({ to: "/visa/applications" });
                  } catch (err: any) {
                    console.error("API ERROR", err);
                    console.error("RESPONSE", err?.response?.data);
                    const responseData = err?.response?.data;
                    const msg = responseData ?? err?.message ?? String(err);
                    const validation =
                      responseData?.errors || responseData?.validation;
                    if (validation) {
                      const details =
                        typeof validation === "string"
                          ? validation
                          : JSON.stringify(validation);
                      setError(details);
                      toast.error("Validation error: " + details);
                    } else {
                      const details =
                        typeof responseData === "string"
                          ? responseData
                          : responseData
                            ? JSON.stringify(responseData)
                            : String(msg);
                      setError(details);
                      toast.error(details);
                    }
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? "Submitting…" : "Submit application"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
