const levelClasses = {
  INFO: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  WARN: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  ERROR: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  DEBUG: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
};

export default function LogsPanel({
  title = "System Logs",
  subtitle = "Realtime telemetry and audit events",
  logs = [],
}) {
  return (
    <section className="card-panel h-full">
      <div className="card-header">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="status-pill border-slate-700 bg-slate-950/70 text-slate-300">
          {logs.length} events
        </div>
      </div>

      <div className="thin-scrollbar max-h-[500px] space-y-3 overflow-y-auto pr-1">
        {logs.map((log) => (
          <article
            key={log.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={[
                  "status-pill border px-2.5 py-1",
                  levelClasses[log.level] || levelClasses.INFO,
                ].join(" ")}
              >
                {log.level}
              </span>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {log.timestamp}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-100">{log.message}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
              {log.source}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
