import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { toast } from "sonner";
import { resetPassword } from "@erp/services/authService";

export const Route = createFileRoute("/reset-password")({ component: Page });
function Page() {
  const navigate = useNavigate();
  const [p, setP] = React.useState({ a: "", b: "" });
  const [loading, setLoading] = React.useState(false);
  const resetToken =
    typeof window === "undefined"
      ? ""
      : new URLSearchParams(window.location.search).get("token") ?? "";

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (p.a !== p.b) { toast.error("Passwords don't match"); return; }
    if (p.a.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (!resetToken) { toast.error("Reset token is missing."); return; }

    setLoading(true);

    try {
      await resetPassword({ token: resetToken, password: p.a });
      toast.success("Password updated");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          error?.message ??
          "Unable to update password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password you haven't used before."
      footer={<Link to="/login" className="text-primary font-medium">Back to login</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label>New password</Label><Input type="password" value={p.a} onChange={(e) => setP({...p, a: e.target.value})} /></div>
        <div className="space-y-2"><Label>Confirm password</Label><Input type="password" value={p.b} onChange={(e) => setP({...p, b: e.target.value})} /></div>
        <Button className="w-full" disabled={loading}>Update password</Button>
      </form>
    </AuthLayout>
  );
}
