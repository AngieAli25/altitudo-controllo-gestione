'use client';

import { useRouter } from 'next/navigation';

interface DashboardFiltersProps {
  months: { value: string; label: string }[];
  currentMonth: string;
}

export default function DashboardFilters({ months, currentMonth }: DashboardFiltersProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="dash-month-select" className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">
        Periodo
      </label>
      <select
        id="dash-month-select"
        value={currentMonth}
        onChange={(e) => {
          const val = e.target.value;
          router.push(val === 'all' ? '/dashboard' : `/dashboard?month=${val}`);
        }}
        className="bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--text-secondary)] transition-colors"
      >
        <option value="all" className="bg-[var(--select-option-bg)] text-[var(--text-primary)]">
          Tutti
        </option>
        {months.map((m) => (
          <option key={m.value} value={m.value} className="bg-[var(--select-option-bg)] text-[var(--text-primary)]">
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
