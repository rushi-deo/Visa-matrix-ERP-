import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

function titleize(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const parts = path.split("/").filter(Boolean);
  return (
    <nav
      className="flex items-center gap-1 text-sm text-muted-foreground"
      aria-label="Breadcrumb"
    >
      <Link
        to="/dashboard"
        className="hover:text-foreground inline-flex items-center"
      >
        <Home className="size-3.5" />
      </Link>

      {parts.map((p, i) => {
        const href = `/${parts.slice(0, i + 1).join("/")}`;
        const last = i === parts.length - 1;

        // Hide UUID-like route parameters
        if (last && /^[0-9a-fA-F-]{36}$/.test(p)) {
          return null;
        }

        return (
          <span key={href} className="inline-flex items-center gap-1">
            <ChevronRight className="size-3.5" />

            {last ? (
              <span className="text-foreground font-medium">
                {titleize(p)}
              </span>
            ) : (
              <Link to={href} className="hover:text-foreground">
                {titleize(p)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
