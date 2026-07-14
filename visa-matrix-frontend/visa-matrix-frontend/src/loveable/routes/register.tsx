import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: Page });
function Page() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [f, setF] = React.useState({ name: "", email: "", password: "", company: "" });
  const [loading, setLoading] = React.useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.email || f.password.length < 8) {
      toast.error("Please complete the form with a valid email and 8 character password.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: f.name,
        email: f.email,
        password: f.password,
      });
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          error?.message ??
          "Unable to create account.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout title="Create your account" subtitle="Start managing visa cases in minutes."
      footer={<>Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 col-span-2"><Label>Full name</Label><Input value={f.name} onChange={(e) => setF({...f, name: e.target.value})} /></div>
          <div className="space-y-2 col-span-2"><Label>Work email</Label><Input type="email" value={f.email} onChange={(e) => setF({...f, email: e.target.value})} /></div>
          <div className="space-y-2 col-span-2"><Label>Company</Label><Input value={f.company} onChange={(e) => setF({...f, company: e.target.value})} /></div>
          <div className="space-y-2 col-span-2"><Label>Password</Label><Input type="password" value={f.password} onChange={(e) => setF({...f, password: e.target.value})} /></div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>Create account</Button>
      </form>
    </AuthLayout>
  );
}
