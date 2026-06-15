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
import apiClient from "@erp/services/apiClient";
import { toast } from "sonner";

export type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

type CustomerForm = {
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
};

const initialForm: CustomerForm = {
  fullName: "",
  email: "",
  phone: "",
  passportNumber: "",
  nationality: "",
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const maybeAxiosError = error as {
      message?: string;
      response?: { data?: unknown };
    };
    const responseData = maybeAxiosError.response?.data;

    if (typeof responseData === "string") {
      return responseData;
    }

    if (responseData) {
      return JSON.stringify(responseData);
    }

    if (maybeAxiosError.message) {
      return maybeAxiosError.message;
    }
  }

  return String(error);
};

export function CustomerCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<CustomerForm>(initialForm);

  const close = () => onOpenChange(false);

  const updateField =
    (field: keyof CustomerForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const submit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        passport_number: form.passportNumber,
        nationality: form.nationality,
      };

      await apiClient.post("/customers", payload);
      toast.success("Customer created successfully");
      await Promise.resolve(onCreated?.());
      setForm(initialForm);
      close();
    } catch (err) {
      console.error("Failed to create customer:", err);
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>
            Fill in customer details and submit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={form.fullName} onChange={updateField("fullName")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={updateField("email")}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={updateField("phone")} />
          </div>
          <div className="space-y-2">
            <Label>Passport Number</Label>
            <Input
              value={form.passportNumber}
              onChange={updateField("passportNumber")}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Nationality</Label>
            <Input
              value={form.nationality}
              onChange={updateField("nationality")}
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

export default CustomerCreateDialog;
