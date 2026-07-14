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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

type SelectOption = {
  id: string;
  name: string;
};

const extractCountries = (response: any): SelectOption[] => {
  const payload = response?.data;
  const items = Array.isArray(payload?.data?.items)
    ? payload.data.items
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

  return items
    .map((item: any) => ({
      id: String(item?.id ?? item?.country_id ?? ""),
      name: String(item?.name ?? item?.country ?? ""),
    }))
    .filter((item: SelectOption) => item.id && item.name);
};

const extractVisaTypes = (response: any): SelectOption[] => {
  const payload = response?.data;
  const items = Array.isArray(payload?.data?.items)
    ? payload.data.items
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

  return items
    .map((item: any) => ({
      id: String(item?.id ?? item?.visa_type_id ?? ""),
      name: String(item?.name ?? item?.visa_type ?? item?.type ?? ""),
    }))
    .filter((item: SelectOption) => item.id && item.name);
};

export function ApplicationCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [countries, setCountries] = React.useState<SelectOption[]>([]);
  const [visaTypes, setVisaTypes] = React.useState<SelectOption[]>([]);
  const [loadingCountries, setLoadingCountries] = React.useState(false);
  const [loadingVisaTypes, setLoadingVisaTypes] = React.useState(false);
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

  React.useEffect(() => {
    console.log("Dialog open:", open);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    let mounted = true;

    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        console.log("Loading countries...");
        const response = await apiClient.get("/countries");
        console.log("Countries response:", response);

        if (mounted) {
          setCountries(extractCountries(response));
        }
      } catch (error) {
        console.error("Countries error:", error);
        if (mounted) {
          setCountries([]);
          toast.error("Failed to load countries");
        }
      } finally {
        if (mounted) {
          setLoadingCountries(false);
        }
      }
    };

    loadCountries();

    return () => {
      mounted = false;
    };
  }, [open]);

  React.useEffect(() => {
    setVisaType("");

    if (!country) {
      setVisaTypes([]);
      setLoadingVisaTypes(false);
      return;
    }

    let mounted = true;

    const loadVisaTypes = async () => {
      setLoadingVisaTypes(true);
      try {
        console.log("Loading visa types...");
        const response = await apiClient.get("/visa-types", {
          params: { country_id: country },
        });
        console.log("Visa types response:", response);

        if (mounted) {
          setVisaTypes(extractVisaTypes(response));
        }
      } catch (error) {
        console.error("Visa types error:", error);
        if (mounted) {
          setVisaTypes([]);
          toast.error("Failed to load visa types");
        }
      } finally {
        if (mounted) {
          setLoadingVisaTypes(false);
        }
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
              onValueChange={setCountry}
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
