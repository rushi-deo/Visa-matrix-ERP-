import React from "react";

import { Search, LayoutDashboard, Users, FileText } from "lucide-react";

import { Button } from "../../components/ui/button";

export default function GlobalSearch() {
  const [open, setOpen] = React.useState(false);

  const items = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Customers",
      to: "/customers",
      icon: Users,
    },
    {
      label: "Visa Applications",
      to: "/visa-applications",
      icon: FileText,
    },
  ];

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative w-full sm:w-72">
      <Button
        variant="outline"
        className="w-full justify-between text-slate-500"
        onClick={() => setOpen(!open)}
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search anything...
        </span>

        <kbd className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-xs sm:inline">
          ⌘K
        </kbd>
      </Button>

      {open && (
        <div className="absolute top-12 z-50 w-full rounded-lg border bg-white shadow-lg">
          <div className="border-b p-2">
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full rounded border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="p-2">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.to}
                  href={item.to}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}