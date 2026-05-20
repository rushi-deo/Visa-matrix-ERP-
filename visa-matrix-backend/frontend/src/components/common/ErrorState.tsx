type ErrorStateProps = {
  title?: string;
  description: string;
};

export default function ErrorState({
  title = "We could not load this module",
  description,
}: ErrorStateProps) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
      <h3 className="text-base font-semibold text-rose-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-600">{description}</p>
    </div>
  );
}
