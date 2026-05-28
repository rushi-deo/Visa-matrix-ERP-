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
  const { login } = useAuth(); const navigate = useNavigate();
  const [f, setF] = React.useState({ name: "", email: "", password: "", company: "" });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.email || f.password.length < 6) { toast.error("Please complete the form"); return; }
    login(f.email);
    toast.success("Account created");
    navigate({ to: "/otp" });
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
        <Button type="submit" className="w-full">Create account</Button>
      </form>
    </AuthLayout>
  );
}
