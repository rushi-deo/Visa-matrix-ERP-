import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/session-expired")({ component: Page });
function Page() {
  return (
    <AuthLayout title="Session expired" subtitle="For your security, you've been signed out due to inactivity.">
      <div className="space-y-6">
        <div className="rounded-lg border bg-warning/5 p-4 flex gap-3">
          <Clock className="size-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm">Any unsaved changes have been preserved as a draft. Sign in again to continue where you left off.</p>
        </div>
        <Button asChild className="w-full"><Link to="/login">Sign in again</Link></Button>
      </div>
    </AuthLayout>
  );
}