interface InsightCardProps {
  label: string;
  value: string | number;
}

export function InsightCard({ label, value }: InsightCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 sm:p-4 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
