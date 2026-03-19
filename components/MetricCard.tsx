interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export default function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6">
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{value}</p>
      {subtitle && (
        <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
