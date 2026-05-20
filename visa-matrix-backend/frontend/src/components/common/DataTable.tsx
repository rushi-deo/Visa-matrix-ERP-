import type { ReactNode } from "react";

import EmptyState from "./EmptyState";

export type TableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  emptyTitle: string;
  emptyDescription: string;
};

export default function DataTable<T>({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  "px-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400",
                  column.className || "",
                ].join(" ")}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="rounded-2xl bg-slate-50">
              {columns.map((column) => (
                <td
                  key={`${column.key}-${index}`}
                  className={[
                    "border-y border-slate-200 px-4 py-4 text-sm text-slate-600 first:rounded-l-2xl first:border-l last:rounded-r-2xl last:border-r",
                    column.className || "",
                  ].join(" ")}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
