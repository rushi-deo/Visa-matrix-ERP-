export default function ChartCard({ title, subtitle, actions, children }) {
  return (
    <section className="card-panel h-full">
      <div className="card-header">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {actions ? <div className="text-sm text-slate-400">{actions}</div> : null}
      </div>
      <div className="h-[280px]">{children}</div>
    </section>
  );
}
