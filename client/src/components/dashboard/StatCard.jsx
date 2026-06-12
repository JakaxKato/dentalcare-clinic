const StatCard = ({ label, value, icon, color = 'brand' }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-100 text-${color}-600`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default StatCard;
