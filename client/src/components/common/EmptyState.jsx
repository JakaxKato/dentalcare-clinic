const EmptyState = ({ icon = '📭', title = 'Belum ada data', description, action }) => (
  <div className="text-center py-16 px-6">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    {description && <p className="text-slate-500 mt-1">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
