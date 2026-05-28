import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
export const Route = createFileRoute("/_app/settings/api")({ component: () => (
  <>
    <PageHeader title="API Settings" actions={<Button>Generate key</Button>} />
    <Card><CardContent className="p-6 space-y-4">
      <div className="space-y-2"><Label>Webhook URL</Label><Input defaultValue="https://api.visamatrix.io/webhooks" /></div>
      <div className="space-y-2"><Label>Public API base</Label><Input defaultValue="https://api.visamatrix.io/v1" /></div>
      <div className="divide-y border-t">{["prod_key_live","staging_key","sandbox_key"].map((k) => (
        <div key={k} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2"><Key className="size-4 text-muted-foreground" /><span className="font-mono text-sm">{k}_••••••••••</span></div>
          <Button variant="outline" size="sm">Revoke</Button>
        </div>
      ))}</div>
    </CardContent></Card>
  </>
) });
