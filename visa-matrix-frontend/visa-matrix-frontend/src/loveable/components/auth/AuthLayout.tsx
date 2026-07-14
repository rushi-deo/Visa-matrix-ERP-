import visaMatrixLogo from "../../../assets/visa-matrix-logo.jpg";

export function AuthLayout({ title, subtitle, children, footer }: {
  title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-6 lg:p-10 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="flex items-start">
          <img src={visaMatrixLogo} alt="Visa Matrix" className="h-16 w-auto rounded-md object-contain" />
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight">Streamline every visa case, from intake to approval.</h2>
          <p className="mt-3 text-sidebar-foreground/70">A unified platform for HR, CRM, document workflows, finance, and embassy operations — built for modern immigration teams.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[['20k+','Applications'],['98%','Approval Rate'],['50+','Countries']].map(([v,l]) => (
              <div key={l} className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3">
                <p className="text-xl font-semibold">{v}</p>
                <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} Visa Matrix Pvt Ltd</p>
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-sidebar-primary/10 blur-3xl" />
      </div>
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-8 lg:p-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-6 flex justify-center md:justify-start">
            <img src={visaMatrixLogo} alt="Visa Matrix" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}