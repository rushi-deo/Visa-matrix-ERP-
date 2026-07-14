import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/_app/settings")({ component: () => (
  <>
    <PageHeader title="General Settings" description="Organization-wide preferences." actions={<Button>Save changes</Button>} />
    <Card><CardContent className="p-6 grid sm:grid-cols-2 gap-4">
      <div className="space-y-2"><Label>Organization name</Label><Input defaultValue="Visa Matrix Pvt Ltd" /></div>
      <div className="space-y-2"><Label>Support email</Label><Input defaultValue="support@visamatrix.io" /></div>
      <div className="space-y-2"><Label>Default currency</Label><Input defaultValue="USD" /></div>
      <div className="space-y-2"><Label>Default timezone</Label><Input defaultValue="Asia/Kolkata" /></div>
      <div className="flex items-center justify-between sm:col-span-2 border-t pt-4"><div><p className="font-medium">Email notifications</p><p className="text-sm text-muted-foreground">Send daily case digests to admins.</p></div><Switch defaultChecked /></div>
      <div className="flex items-center justify-between sm:col-span-2"><div><p className="font-medium">Two-factor authentication</p><p className="text-sm text-muted-foreground">Require 2FA for all admin users.</p></div><Switch defaultChecked /></div>
    </CardContent></Card>
  </>
) });
