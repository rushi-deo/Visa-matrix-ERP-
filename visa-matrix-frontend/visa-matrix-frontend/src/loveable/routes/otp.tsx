import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  InputOTP, InputOTPGroup, InputOTPSlot,
} from "@/components/ui/input-otp";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/otp")({ component: Page });
function Page() {
  const navigate = useNavigate();
  const [v, setV] = React.useState("");
  return (
    <AuthLayout title="Verify your identity" subtitle="Enter the 6-digit code sent to your email.">
      <div className="space-y-6">
        <InputOTP maxLength={6} value={v} onChange={setV}>
          <InputOTPGroup>
            {Array.from({length: 6}).map((_,i) => <InputOTPSlot key={i} index={i} />)}
          </InputOTPGroup>
        </InputOTP>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => toast.success("New code sent")}>Resend code</Button>
          <Button className="flex-1" onClick={() => { if (v.length === 6) navigate({ to: "/dashboard" }); else toast.error("Enter all 6 digits"); }}>Verify</Button>
        </div>
      </div>
    </AuthLayout>
  );
}
