'use client';

import { useRouter } from 'next/navigation';

interface ReportFiltersProps {
  months: { value: string; label: string }[];
  currentMonth: string;
}

export default function ReportFilters({ months, currentMonth }: ReportFiltersProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="month-select" className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">
        Periodo
      </label>
      <select
        id="month-select"
        value={currentMonth}
        onChange={(e) => router.push(`/report?month=${e.target.value}`)}
        className="bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--text-secondary)] transition-colors"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value} className="bg-[var(--select-option-bg)] text-[var(--text-primary)]">
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
