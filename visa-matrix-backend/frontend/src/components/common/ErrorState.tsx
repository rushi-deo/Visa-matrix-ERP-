type ErrorStateProps = {
  title?: string;
  description: string;
};

export default function ErrorState({
  title = "We could not load this module",
  description,
}: ErrorStateProps) {
  return (
    <div className={[
      "rounded-premium border border-premium-rose/30",
      "bg-gradient-to-br from-premium-rose/10 to-premium-rose/5",
      "p-6 transition-all duration-300 hover:shadow-sm",
    ].join(" ")}>
      <h3 className="text-base font-semibold text-premium-rose">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-premium-rose/80">{description}</p>
    </div>
  );
}
