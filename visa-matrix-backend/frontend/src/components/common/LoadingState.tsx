type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({
  label = "Loading Visa Matrix data...",
}: LoadingStateProps) {
  return (
    <div className={[
      "flex min-h-[220px] flex-col items-center justify-center gap-4",
      "rounded-premium border border-dashed border-premium-silver-200/70",
      "bg-gradient-to-br from-white/60 to-premium-platinum-50/60",
      "p-10 text-center backdrop-blur-sm",
    ].join(" ")}>
      <div className={[
        "h-12 w-12 animate-spin rounded-full border-4",
        "border-premium-blue-100/40 border-t-premium-blue-500",
        "shadow-glow-sm",
      ].join(" ")} />
      <p className="text-sm font-medium text-premium-silver-500">{label}</p>
    </div>
  );
}
