import React from "react";
import { ChevronRight, Home } from "lucide-react";

function titleize(s) {
  return s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumbs() {
  const path = window.location.pathname;

  const parts = path.split("/").filter(Boolean);

  let acc = "";

  return (
    <nav
      className="flex items-center gap-1 text-sm text-slate-500"
      aria-label="Breadcrumb"
    >
      <a
        href="/dashboard"
        className="inline-flex items-center hover:text-black"
      >
        <Home className="h-3.5 w-3.5" />
      </a>

      {parts.map((p, i) => {
        acc += "/" + p;

        const last = i === parts.length - 1;

        return (
          <span
            key={acc}
            className="inline-flex items-center gap-1"
          >
            <ChevronRight className="h-3.5 w-3.5" />

            {last ? (
              <span className="font-medium text-black">
                {titleize(p)}
              </span>
            ) : (
              <a
                href={acc}
                className="hover:text-black"
              >
                {titleize(p)}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}