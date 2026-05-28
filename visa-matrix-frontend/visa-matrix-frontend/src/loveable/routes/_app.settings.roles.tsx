import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
const perms = ["View","Create","Edit","Delete","Approve","Export"];
const modules = ["Applications","Employees","Leads","Invoices","Documents","Settings"];
const roles = ["Super Admin","HR","Finance","CRM","Employee"];
export const Route = createFileRoute("/_app/settings/roles")({ component: () => (
  <>
    <PageHeader title="Roles & Permissions" actions={<Button>New role</Button>} />
    <Card><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40"><tr><th className="text-left p-3">Module</th>{roles.map((r) => <th key={r} className="text-left p-3">{r}</th>)}</tr></thead>
        <tbody className="divide-y">{modules.map((m) => (
          <tr key={m}><td className="p-3 font-medium">{m}</td>{roles.map((r) => (
            <td key={r} className="p-3"><div className="flex flex-wrap gap-2">{perms.map((p) => (
              <label key={p} className="inline-flex items-center gap-1 text-xs"><Checkbox defaultChecked={r==="Super Admin"} /> {p}</label>
            ))}</div></td>
          ))}</tr>
        ))}</tbody>
      </table>
    </CardContent></Card>
  </>
) });
