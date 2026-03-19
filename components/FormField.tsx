interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

const inputClasses =
  'w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--text-secondary)] transition-colors disabled:opacity-50';

const labelClasses = 'block text-sm text-[var(--text-secondary)] mb-2';

export default function FormField({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  placeholder,
  disabled,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
      />
    </div>
  );
}

interface TextareaFieldProps {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export function TextareaField({
  label,
  name,
  required,
  defaultValue,
  placeholder,
  disabled,
  rows = 4,
}: TextareaFieldProps) {
  return (
    <div>
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={inputClasses + ' resize-none'}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  name,
  required,
  defaultValue,
  disabled,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        disabled={disabled}
        className={inputClasses + ' appearance-none cursor-pointer'}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
