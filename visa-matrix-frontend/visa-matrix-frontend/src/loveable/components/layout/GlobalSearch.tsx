import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import { navGroups } from "@/lib/nav-config";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button variant="outline" className="w-full sm:w-72 justify-between text-muted-foreground" onClick={() => setOpen(true)}>
        <span className="inline-flex items-center gap-2"><Search className="size-4" /> Search anything…</span>
        <kbd className="hidden sm:inline text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-xl overflow-hidden">
          <Command>
            <CommandInput placeholder="Search pages, applications, customers…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {navGroups.map((g) => (
                <CommandGroup key={g.label} heading={g.label}>
                  {g.items.map((i) => (
                    <CommandItem key={i.to} onSelect={() => { setOpen(false); navigate({ to: i.to }); }}>
                      <i.icon className="size-4 mr-2" /> {i.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
