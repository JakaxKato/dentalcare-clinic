export const Input = ({ label, error, hint, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="label">{label}</label>}
    <input className={`input ${error ? 'border-rose-400 focus:ring-rose-200' : ''}`} {...props} />
    {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, rows = 4, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="label">{label}</label>}
    <textarea
      rows={rows}
      className={`input resize-y ${error ? 'border-rose-400 focus:ring-rose-200' : ''}`}
      {...props}
    />
    {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
  </div>
);

export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="label">{label}</label>}
    <select className={`input ${error ? 'border-rose-400 focus:ring-rose-200' : ''}`} {...props}>
      {children}
    </select>
    {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
  </div>
);

export default Input;
