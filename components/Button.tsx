interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'submit' | 'button';
  className?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
}: ButtonProps) {
  const base = 'rounded-full px-6 py-3 uppercase tracking-wider text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]',
    secondary:
      'border border-[var(--btn-secondary-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface)]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
