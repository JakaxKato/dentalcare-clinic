import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, hint, className = '', id, name, ...props },
  ref
) {
  const inputId = id || name;
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <input
        id={inputId}
        name={name}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`input ${error ? 'border-rose-400 focus:ring-rose-200' : ''}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-stone-500 mt-1">{hint}</p>}
      {error && <p id={`${inputId}-error`} className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, rows = 4, className = '', id, name, ...props },
  ref
) {
  const inputId = id || name;
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <textarea
        id={inputId}
        name={name}
        ref={ref}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`input resize-y ${error ? 'border-rose-400 focus:ring-rose-200' : ''}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-stone-500 mt-1">{hint}</p>}
      {error && <p id={`${inputId}-error`} className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, children, className = '', id, name, ...props },
  ref
) {
  const inputId = id || name;
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <select
        id={inputId}
        name={name}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={`input ${error ? 'border-rose-400 focus:ring-rose-200' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
});

export default Input;
