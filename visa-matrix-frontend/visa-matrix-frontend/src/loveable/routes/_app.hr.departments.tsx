import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { employees } from "@/lib/mock-data";
import { Building2 } from "lucide-react";
export const Route = createFileRoute("/_app/hr/departments")({
  component: () => {
    const map = new Map<string, number>();
    employees.forEach((e) =>
      map.set(e.department, (map.get(e.department) ?? 0) + 1),
    );
    return (
      <>
        <PageHeader
          title="Departments"
          description="Organizational structure."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...map.entries()].map(([name, count]) => (
            <Card key={name}>
              <CardContent className="p-5">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">
                  <Building2 className="size-5" />
                </div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">{count} members</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  },
});
