import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: Page });
function Page() {
  const navigate = useNavigate();
  const [p, setP] = React.useState({ a: "", b: "" });
  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password you haven't used before."
      footer={<Link to="/login" className="text-primary font-medium">Back to login</Link>}>
      <form onSubmit={(e) => { e.preventDefault();
        if (p.a !== p.b) { toast.error("Passwords don't match"); return; }
        toast.success("Password updated"); navigate({ to: "/login" });
      }} className="space-y-4">
        <div className="space-y-2"><Label>New password</Label><Input type="password" value={p.a} onChange={(e) => setP({...p, a: e.target.value})} /></div>
        <div className="space-y-2"><Label>Confirm password</Label><Input type="password" value={p.b} onChange={(e) => setP({...p, b: e.target.value})} /></div>
        <Button className="w-full">Update password</Button>
      </form>
    </AuthLayout>
  );
}
