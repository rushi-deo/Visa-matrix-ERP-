import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({ component: Page });
function Page() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a verification code."
      footer={<Link to="/login" className="text-primary font-medium">Back to login</Link>}>
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Code sent to " + email); navigate({ to: "/otp" }); }} className="space-y-4">
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <Button className="w-full">Send reset code</Button>
      </form>
    </AuthLayout>
  );
}
