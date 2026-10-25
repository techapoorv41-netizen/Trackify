import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export function Field({ label, error, hint, required, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? <p id={`${htmlFor}-error`} role="alert" className="field-error">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export const TextField = forwardRef(function TextField({ label, error, hint, required, type = 'text', ...rest }, ref) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={id}>
      <input
        id={id}
        ref={ref}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input ${error ? 'input-error' : ''}`}
        {...rest}
      />
    </Field>
  );
});

export const SelectField = forwardRef(function SelectField({ label, error, hint, required, options, placeholder = 'Select…', ...rest }, ref) {
  const id = useId();
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={id}>
      <div className="relative">
        <select id={id} ref={ref} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`input appearance-none pr-9 ${error ? 'input-error' : ''}`} {...rest}>
          <option value="">{placeholder}</option>
          {items.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
    </Field>
  );
});

export const TextAreaField = forwardRef(function TextAreaField({ label, error, hint, required, rows = 4, ...rest }, ref) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={id}>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input resize-y ${error ? 'input-error' : ''}`}
        {...rest}
      />
    </Field>
  );
});

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={`flex items-start justify-between gap-4 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
