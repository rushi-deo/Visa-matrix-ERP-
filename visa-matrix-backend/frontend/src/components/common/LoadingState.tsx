type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({
  label = "Loading Visa Matrix data...",
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-10 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-[#1E5BB8]" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
