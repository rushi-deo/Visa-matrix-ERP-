import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import * as React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("admin@visamatrix.io");
  const [password, setPassword] = React.useState("password");
  const [role, setRole] = React.useState<Role>("super_admin");
  const [error, setError] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    if (password.length < 4) { setError("Password is too short"); return; }
    setLoading(true);
    setTimeout(() => {
      login(email, role);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    }, 700);
  }

  return (
    <AuthLayout title="Sign in" subtitle="Use your work account to access Visa Matrix."
      footer={<>Don't have an account? <Link to="/register" className="text-primary font-medium">Create one</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Sign in as</Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="hr">HR Manager</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="crm">CRM Executive</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Remember me on this device</label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 mr-2 animate-spin" />}Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
