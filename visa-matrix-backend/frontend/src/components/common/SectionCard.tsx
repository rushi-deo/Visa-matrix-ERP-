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
        "rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(11,46,89,0.08)]",
        className,
      ].join(" ")}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
