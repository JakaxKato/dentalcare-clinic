const StatCard = ({ label, value, icon, trend }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-bold text-stone-950 dark:text-stone-50 tabular">
        {value}
      </p>
    </div>
  </div>
);

export default StatCard;
