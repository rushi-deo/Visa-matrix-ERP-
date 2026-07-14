import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
export const Route = createFileRoute("/_app/settings/security")({ component: () => (
  <>
    <PageHeader title="Security" description="Auth and access controls." />
    <Card><CardContent className="p-6 divide-y">
      {[["Enforce 2FA","Require all users to enable two-factor auth"],["Single Sign-On","Allow SSO via SAML/Google Workspace"],["Session timeout","Auto sign-out after 30 minutes of inactivity"],["IP allowlist","Restrict logins to approved IP ranges"],["Audit logging","Capture every admin action"]].map(([t,d]) => (
        <div key={t} className="flex items-center justify-between py-4 first:pt-0 last:pb-0"><div><p className="font-medium">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div><Switch defaultChecked /></div>
      ))}
    </CardContent></Card>
  </>
) });
