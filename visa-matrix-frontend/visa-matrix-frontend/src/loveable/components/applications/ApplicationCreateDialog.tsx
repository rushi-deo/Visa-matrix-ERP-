"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import apiClient, { API_ENDPOINTS } from "@erp/services/apiClient";
import { toast } from "sonner";
import { asApiRecord, asApiRecords, type ApiRecord, readApiString } from "@/lib/api-record";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

type SelectOption = {
  id: string;
  name: string;
};

const responseItems = (response: unknown): ApiRecord[] => {
  const responseRecord = asApiRecord(response);
  const payload = asApiRecord(responseRecord?.data);
  const nestedPayload = asApiRecord(payload?.data);
  const candidates = [nestedPayload?.items, payload?.items, payload?.data, response];
  const collection = candidates.find(Array.isArray);
  return asApiRecords(collection);
};

const toSelectOptions = (
  records: ApiRecord[],
  idKeys: readonly string[],
  nameKeys: readonly string[],
): SelectOption[] => records.flatMap((item) => {
  const id = readApiString(item, idKeys);
  const name = readApiString(item, nameKeys);
  return id && name ? [{ id, name }] : [];
});

const extractCountries = (response: unknown): SelectOption[] =>
  toSelectOptions(responseItems(response), ["id", "country_id"], ["name", "country"]);

const extractVisaTypes = (response: unknown): SelectOption[] =>
  toSelectOptions(responseItems(response), ["id", "visa_type_id"], ["name", "visa_type", "type"]);

export function ApplicationCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [countries, setCountries] = React.useState<SelectOption[]>([]);
  const [visaTypes, setVisaTypes] = React.useState<SelectOption[]>([]);
  const [countriesLoaded, setCountriesLoaded] = React.useState(false);
  const [visaTypesLoadedForCountry, setVisaTypesLoadedForCountry] = React.useState<string | null>(null);
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
  const loadingCountries = open && !countriesLoaded;
  const loadingVisaTypes = Boolean(country) && visaTypesLoadedForCountry !== country;

  React.useEffect(() => {
    console.log("Dialog open:", open);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    let mounted = true;

    const loadCountries = async () => {
      try {
        console.log("Loading countries...");
        const response = await apiClient.get("/countries");
        console.log("Countries response:", response);

        if (mounted) {
          setCountries(extractCountries(response));
          setCountriesLoaded(true);
        }
      } catch (error) {
        console.error("Countries error:", error);
        if (mounted) {
          setCountries([]);
          setCountriesLoaded(true);
          toast.error("Failed to load countries");
        }
      } finally {
      }
    };

    loadCountries();

    return () => {
      mounted = false;
    };
  }, [open]);

  React.useEffect(() => {
    if (!country) {
      return;
    }

    let mounted = true;

    const loadVisaTypes = async () => {
      try {
        console.log("Loading visa types...");
        const response = await apiClient.get("/visa-types", {
          params: { country_id: country },
        });
        console.log("Visa types response:", response);

        if (mounted) {
          setVisaTypes(extractVisaTypes(response));
          setVisaTypesLoadedForCountry(country);
        }
      } catch (error) {
        console.error("Visa types error:", error);
        if (mounted) {
          setVisaTypes([]);
          setVisaTypesLoadedForCountry(country);
          toast.error("Failed to load visa types");
        }
      } finally {
      }
    };

    loadVisaTypes();

    return () => {
      mounted = false;
    };
  }, [country]);

  const close = () => onOpenChange(false);

  const submit = async () => {
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

      const customerResp = await apiClient.post("/customers", customerPayload);
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
      onCreated?.();
      close();
    } catch (err: unknown) {
      console.error("API ERROR", err);
      const errorRecord = asApiRecord(err);
      const response = asApiRecord(errorRecord?.response);
      const responseData = response?.data;
      const responseDataRecord = asApiRecord(responseData);
      const msg = responseData ?? (err instanceof Error ? err.message : String(err));
      const validation =
        responseDataRecord?.errors || responseDataRecord?.validation;
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Visa Application</DialogTitle>
          <DialogDescription>
            Fill in applicant details and submit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Passport number</Label>
            <Input
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={country}
              onValueChange={(nextCountry) => {
                setCountry(nextCountry);
                setVisaType("");
                setVisaTypes([]);
                setVisaTypesLoadedForCountry(null);
                setError(null);
              }}
              disabled={loadingCountries}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingCountries ? "Loading countries..." : "Select country"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
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
              disabled={!country || loadingVisaTypes}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !country
                      ? "Select country first"
                      : loadingVisaTypes
                        ? "Loading visa types..."
                        : "Select visa type"
                  }
                />
              </SelectTrigger>
              <SelectContent>
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
              value={travelDate ?? ""}
              onChange={(e) => setTravelDate(e.target.value || null)}
            />
          </div>
          <div className="space-y-2">
            <Label>Duration of stay</Label>
            <Input
              placeholder="e.g. 30 days"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Purpose</Label>
            <Textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ApplicationCreateDialog;
