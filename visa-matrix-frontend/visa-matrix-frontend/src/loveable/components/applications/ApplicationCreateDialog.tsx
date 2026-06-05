"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
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
import { countries, visaCategories } from "@/lib/mock-data";
import apiClient, { API_ENDPOINTS } from "@erp/services/apiClient";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function ApplicationCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  React.useEffect(() => {
    console.log("Dialog open:", open);
  }, [open]);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  const close = () => onOpenChange(false);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
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

      const resp = await apiClient.post(API_ENDPOINTS.applications, body);
      const created = resp?.data?.data ?? resp?.data ?? resp;
      toast.success("Application created");
      onCreated?.();
      close();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || String(err);
      const validation =
        err?.response?.data?.errors || err?.response?.data?.validation;
      if (validation) {
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

        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ApplicationCreateDialog;
