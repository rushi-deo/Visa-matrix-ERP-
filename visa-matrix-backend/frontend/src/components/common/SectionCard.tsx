import type { PropsWithChildren, ReactNode } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>;

export default function SectionCard({
  title,
  description,
  action,
  className = "",
  children,
}: SectionCardProps) {
  return (
    <section
      className={[
        "group relative overflow-hidden rounded-premium border border-premium-blue-500/10 bg-gradient-to-br from-white/95 to-premium-platinum-100",
        "p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-premium-blue-300/50",
        "before:absolute before:-right-16 before:-top-16 before:h-56 before:w-56 before:rounded-full before:bg-gradient-to-br before:from-premium-blue-500/10 before:to-premium-blue-600/5 before:blur-3xl before:opacity-90 before:transition-transform before:duration-300",
        "group-hover:before:scale-110",
        className,
      ].join(" ")}
    >
      {/* Background Accent */}
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-premium-blue-500/10 to-premium-blue-600/5 blur-3xl transition-all duration-300 group-hover:scale-125" />

      {/* Header */}
      <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-premium-navy-950">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-premium-silver-500">
              {description}
            </p>
          ) : null}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
