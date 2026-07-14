import * as React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  accessor?: (row: T) => string | number;
  className?: string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  pageSize?: number;
  rowAction?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({ data, columns, searchKeys, pageSize = 10, rowAction, onRowClick, toolbar }: Props<T>) {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc"|"desc">("asc");

  const filtered = React.useMemo(() => {
    if (!q || !searchKeys) return data;
    const s = q.toLowerCase();
    return data.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(s)));
  }, [data, q, searchKeys]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const get = col.accessor ?? ((r: T) => String((r as any)[sortKey] ?? ""));
    return [...filtered].sort((a, b) => {
      const av = get(a), bv = get(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const cur = Math.min(page, totalPages);
  const rows = sorted.slice((cur-1)*pageSize, cur*pageSize);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        {searchKeys && searchKeys.length > 0 ? (
          <div className="relative max-w-sm w-full">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search..." className="pl-9" />
          </div>
        ) : <div />}
        <div className="flex gap-2">{toolbar}</div>
      </div>
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.sortable ? (
                    <button className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => {
                        if (sortKey === c.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else { setSortKey(c.key); setSortDir("asc"); }
                      }}>
                      {c.header} <ArrowUpDown className="size-3" />
                    </button>
                  ) : c.header}
                </TableHead>
              ))}
              {rowAction && <TableHead className="w-12 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length + (rowAction?1:0)}>
                <EmptyState title="No results" description="Try adjusting your search or filters." />
              </TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id} onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer" : ""}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.render ? c.render(row) : String((row as any)[c.key] ?? "")}
                  </TableCell>
                ))}
                {rowAction && <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>{rowAction(row)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {(cur-1)*pageSize + 1}-{Math.min(cur*pageSize, sorted.length)} of {sorted.length}</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={cur===1} onClick={() => setPage(cur-1)}><ChevronLeft className="size-4" /></Button>
          <span>Page {cur} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={cur===totalPages} onClick={() => setPage(cur+1)}><ChevronRight className="size-4" /></Button>
        </div>
      </div>
    </div>
  );
}