import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Inbox, Send, Archive, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
type MailFolder = { icon: LucideIcon; label: string; count: string };
const folders: MailFolder[] = [
  { icon: Inbox, label: "Inbox", count: "18" },
  { icon: Send, label: "Sent", count: "" },
  { icon: Archive, label: "Archive", count: "" },
  { icon: Trash2, label: "Trash", count: "" },
];
export const Route = createFileRoute("/_app/email")({ component: () => (
  <>
    <PageHeader title="Email Center" actions={<Button><Plus className="size-4 mr-2" />Compose</Button>} />
    <Card className="grid grid-cols-1 md:grid-cols-[200px_1fr] min-h-[60vh] overflow-hidden">
      <div className="border-r p-3 space-y-1">
        {folders.map(({ icon: Icon, label, count }) => (
          <Button key={label} variant="ghost" className="w-full justify-between"><span className="inline-flex items-center gap-2"><Icon className="size-4" />{label}</span>{count && <span className="text-xs text-muted-foreground">{count}</span>}</Button>
        ))}
      </div>
      <div className="divide-y">{Array.from({length: 8}).map((_, i) => (
        <div key={i} className="p-4 hover:bg-muted/40 cursor-pointer">
          <div className="flex justify-between"><p className="font-medium text-sm">Embassy Update — VM-{20240+i}</p><span className="text-xs text-muted-foreground">{i+1}h</span></div>
          <p className="text-sm text-muted-foreground truncate">Your application has been scheduled for biometrics on…</p>
        </div>
      ))}</div>
    </Card>
  </>
) });
