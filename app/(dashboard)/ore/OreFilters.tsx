'use client';

import { useRouter } from 'next/navigation';

interface OreFiltersProps {
  months: { value: string; label: string }[];
  users?: { id: string; full_name: string }[];
  currentMonth?: string;
  currentUserId?: string;
  isAdmin: boolean;
}

export default function OreFilters({
  months,
  users,
  currentMonth,
  currentUserId,
  isAdmin,
}: OreFiltersProps) {
  const router = useRouter();

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    const qs = sp.toString();
    return `/ore${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentMonth ?? ''}
        onChange={(e) =>
          router.push(
            buildUrl({ month: e.target.value || undefined, user_id: currentUserId })
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

      {isAdmin && users && (
        <select
          value={currentUserId ?? ''}
          onChange={(e) =>
            router.push(
              buildUrl({ month: currentMonth, user_id: e.target.value || undefined })
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
