import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { toast } from "sonner";
import { requestPasswordReset } from "@erp/services/authService";

export const Route = createFileRoute("/forgot-password")({ component: Page });
function Page() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset({ email });
      toast.success("Password reset instructions sent to " + email);
      navigate({ to: "/login" });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          error?.message ??
          "Password reset is not available.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a verification code."
      footer={<Link to="/login" className="text-primary font-medium">Back to login</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <Button className="w-full" disabled={loading}>Send reset code</Button>
      </form>
    </AuthLayout>
  );
}
