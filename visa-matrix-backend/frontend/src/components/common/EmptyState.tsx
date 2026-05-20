type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
