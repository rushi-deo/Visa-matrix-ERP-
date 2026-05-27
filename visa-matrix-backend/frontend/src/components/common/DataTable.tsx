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
    <div className="overflow-x-auto rounded-premium border border-premium-silver-200/60 bg-gradient-to-br from-white to-premium-platinum-50 shadow-sm">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-premium-platinum-100/90 text-premium-silver-600">
          <tr className="border-b border-premium-silver-200/70">
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  "sticky top-0 z-10 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider",
                  "bg-premium-platinum-100/95 text-premium-silver-500 backdrop-blur-sm",
                  "transition-colors duration-300",
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
            <tr
              key={index}
              className={[
                "group border-b border-premium-silver-200/30 transition-all duration-300",
                "odd:bg-white even:bg-premium-platinum-50 hover:bg-premium-blue-50/60",
                index === rows.length - 1 ? "border-b-0" : "",
              ].join(" ")}
            >
              {columns.map((column) => (
                <td
                  key={`${column.key}-${index}`}
                  className={[
                    "px-6 py-4 text-sm text-premium-navy-800",
                    "transition-colors duration-300 group-hover:text-premium-navy-950",
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
