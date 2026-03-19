'use client';

import { useRouter } from 'next/navigation';

interface IncassiFiltersProps {
  months: { value: string; label: string }[];
  users?: { id: string; full_name: string }[];
  currentMonth?: string;
  currentSource?: string;
  currentUserId?: string;
  isAdmin: boolean;
}

const sources = [
  { value: '', label: 'Tutte' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'bonifico', label: 'Bonifico' },
  { value: 'contanti', label: 'Contanti' },
  { value: 'altro', label: 'Altro' },
];

export default function IncassiFilters({
  months,
  users,
  currentMonth,
  currentSource,
  currentUserId,
  isAdmin,
}: IncassiFiltersProps) {
  const router = useRouter();

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    const qs = sp.toString();
    return `/incassi${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentMonth ?? ''}
        onChange={(e) =>
          router.push(
            buildUrl({
              month: e.target.value || undefined,
              source: currentSource,
              user_id: currentUserId,
            })
          )
        }
        className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(255,255,255,0.40)]"
      >
        <option value="" className="bg-[var(--select-option-bg)]">Tutti i mesi</option>
        {months.map((m) => (
          <option key={m.value} value={m.value} className="bg-[var(--select-option-bg)]">
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={currentSource ?? ''}
        onChange={(e) =>
          router.push(
            buildUrl({
              month: currentMonth,
              source: e.target.value || undefined,
              user_id: currentUserId,
            })
          )
        }
        className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(255,255,255,0.40)]"
      >
        {sources.map((s) => (
          <option key={s.value} value={s.value} className="bg-[var(--select-option-bg)]">
            {s.label}
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
                source: currentSource,
                user_id: e.target.value || undefined,
              })
            )
          }
          className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(255,255,255,0.40)]"
        >
          <option value="" className="bg-[var(--select-option-bg)]">Tutte le persone</option>
          {users.map((u) => (
            <option key={u.id} value={u.id} className="bg-[var(--select-option-bg)]">
              {u.full_name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
