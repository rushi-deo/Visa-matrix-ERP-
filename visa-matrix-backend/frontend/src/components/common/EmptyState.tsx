type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className={[
      "rounded-premium border-2 border-dashed border-premium-silver-200/70",
      "bg-gradient-to-br from-premium-platinum-50 to-premium-platinum-100",
      "p-12 text-center transition-all duration-300",
      "hover:border-premium-blue-300/50 hover:shadow-sm",
    ].join(" ")}>
      <h3 className="text-base font-semibold text-premium-navy-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-premium-silver-500">{description}</p>
    </div>
  );
}
