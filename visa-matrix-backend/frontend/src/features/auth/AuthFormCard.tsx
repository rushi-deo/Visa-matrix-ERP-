import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

type AuthFormCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footerLabel: string;
  footerLinkText: string;
  footerLinkTo: string;
}>;

export default function AuthFormCard({
  eyebrow,
  title,
  description,
  footerLabel,
  footerLinkText,
  footerLinkTo,
  children,
}: AuthFormCardProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_32px_80px_rgba(11,46,89,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1E5BB8]">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
      <div className="mt-8">{children}</div>
      <p className="mt-8 text-sm text-slate-500">
        {footerLabel}{" "}
        <Link to={footerLinkTo} className="font-semibold text-[#1E5BB8]">
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
}
