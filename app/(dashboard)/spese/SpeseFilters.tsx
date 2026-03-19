'use client';

import { useRouter } from 'next/navigation';

interface SpeseFiltersProps {
  months: { value: string; label: string }[];
  users?: { id: string; full_name: string }[];
  currentMonth?: string;
  currentCategory?: string;
  currentUserId?: string;
  isAdmin: boolean;
}

const categories = [
  { value: '', label: 'Tutte' },
  { value: 'fattura', label: 'Fattura' },
  { value: 'acquisto', label: 'Acquisto' },
  { value: 'rimborso', label: 'Rimborso' },
  { value: 'altro', label: 'Altro' },
];

export default function SpeseFilters({
  months,
  users,
  currentMonth,
  currentCategory,
  currentUserId,
  isAdmin,
}: SpeseFiltersProps) {
  const router = useRouter();

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    const qs = sp.toString();
    return `/spese${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentMonth ?? ''}
        onChange={(e) =>
          router.push(
            buildUrl({
              month: e.target.value || undefined,
              category: currentCategory,
              user_id: currentUserId,
            })
          )
        }
        className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)]"
      >
        <option value="">Tutti i mesi</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={currentCategory ?? ''}
        onChange={(e) =>
          router.push(
            buildUrl({
              month: currentMonth,
              category: e.target.value || undefined,
              user_id: currentUserId,
            })
          )
        }
        className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)]"
      >
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {isAdmin && users && (
        <select
          value={currentUserId ?? ''}
          onChange={(e) =>
            router.push(
              buildUrl({
                month: currentMonth,
                category: currentCategory,
                user_id: e.target.value || undefined,
              })
            )
          }
          className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)]"
        >
          <option value="">Tutte le persone</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
