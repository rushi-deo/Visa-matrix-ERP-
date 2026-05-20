export default function Table({
  title,
  subtitle,
  columns,
  rows,
  emptyText = "No records available.",
  footer,
}) {
  return (
    <section className="table-shell">
      {title || subtitle ? (
        <div className="border-b border-slate-800 px-5 py-5">
          {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={[
                    "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500",
                    column.headerClassName || "",
                  ].join(" ")}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr key={row.id || `${rowIndex}-${rowIndex}`} className="hover:bg-slate-950/40">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={[
                        "px-5 py-4 align-top text-sm text-slate-200",
                        column.className || "",
                      ].join(" ")}
                    >
                      {column.render ? column.render(row, rowIndex) : row[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {footer ? <div className="border-t border-slate-800 px-5 py-4">{footer}</div> : null}
    </section>
  );
}
