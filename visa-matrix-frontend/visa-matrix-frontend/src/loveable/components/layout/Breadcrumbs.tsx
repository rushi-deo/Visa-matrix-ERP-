import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

function titleize(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
export function Breadcrumbs() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const parts = path.split("/").filter(Boolean);
  let acc = "";
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link to="/dashboard" className="hover:text-foreground inline-flex items-center"><Home className="size-3.5" /></Link>
      {parts.map((p, i) => {
        acc += "/" + p;
        const last = i === parts.length - 1;
        return (
          <span key={acc} className="inline-flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            {last ? <span className="text-foreground font-medium">{titleize(p)}</span>
              : <Link to={acc} className="hover:text-foreground">{titleize(p)}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
