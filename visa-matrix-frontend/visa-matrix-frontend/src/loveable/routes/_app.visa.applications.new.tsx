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
import { countries, visaCategories } from "@/lib/mock-data";
import * as React from "react";
import apiClient, { API_ENDPOINTS } from "@erp/services/apiClient";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export const Route = createFileRoute("/_app/visa/applications/new")({
  component: Page,
});
const steps = ["Applicant", "Visa Details", "Documents", "Review"];
function Page() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem
                          key={c.code}
                          value={c.code}
                          onSelect={() => setCountry(c.code)}
                        >
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visa Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {visaCategories.map((v) => (
                        <SelectItem
                          key={v.code}
                          value={v.code}
                          onSelect={() => setVisaType(v.code)}
                        >
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
                    // build payload from controlled state
                    const body = {
                      customerName: fullName,
                      email,
                      phone,
                      passportNumber,
                      address,
                      destinationCountry: country,
                      visaType,
                      travelDate: travelDate || null,
                      durationOfStay: duration || null,
                      purpose,
                    };

                    console.log("Submitting application payload ->", body);

                    const resp = await apiClient.post(
                      API_ENDPOINTS.applications,
                      body,
                    );

                    // backend response mapping
                    const created = resp?.data?.data ?? resp?.data ?? resp;
                    console.log(
                      "Create response ->",
                      resp,
                      "mapped ->",
                      created,
                    );

                    // success handling
                    toast.success("Application created");
                    navigate({ to: "/visa/applications" });
                  } catch (err: any) {
                    console.error("Create application failed:", err);
                    // try to parse validation errors
                    const msg =
                      err?.response?.data?.message ||
                      err?.message ||
                      String(err);
                    const validation =
                      err?.response?.data?.errors ||
                      err?.response?.data?.validation;
                    if (validation) {
                      // map validation object into readable string
                      const details =
                        typeof validation === "string"
                          ? validation
                          : JSON.stringify(validation);
                      setError(details);
                      toast.error("Validation error: " + details);
                    } else {
                      setError(msg);
                      toast.error(msg);
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
