'use client';

import { useActionState, useState, useCallback } from 'react';
import { createWorkEntry } from '@/lib/actions';
import { todayISO } from '@/lib/utils';

interface WorkEntryFormProps {
  hourlyRate: number;
  isAdmin: boolean;
  users: { id: string; full_name: string; company_id: string; hourly_rate: number }[];
  companies: { id: string; name: string }[];
  currentUserId: string;
  currentCompanyId: string;
}

export default function WorkEntryForm({ hourlyRate, isAdmin, users, companies, currentUserId, currentCompanyId }: WorkEntryFormProps) {
  const [hours, setHours] = useState<number>(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState(currentCompanyId);
  const [activeHourlyRate, setActiveHourlyRate] = useState(hourlyRate);
  const [state, formAction, pending] = useActionState(createWorkEntry, null);

  const handleUserChange = useCallback((userId: string) => {
    const selectedUser = users.find((u) => u.id === userId);
    if (selectedUser) {
      setSelectedCompanyId(selectedUser.company_id);
      setActiveHourlyRate(selectedUser.hourly_rate);
    }
  }, [users]);

  const estimatedCost = hours * activeHourlyRate;

  const inputClass =
    'w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)]';

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {isAdmin && (
        <div>
          <label htmlFor="assigned_user_id" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Assegna a
          </label>
          <select
            id="assigned_user_id"
            name="assigned_user_id"
            defaultValue={currentUserId}
            onChange={(e) => handleUserChange(e.target.value)}
            className={inputClass}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-[var(--select-option-bg)]">
                {u.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isAdmin && (
        <div>
          <label htmlFor="company_id" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Azienda
          </label>
          <select
            id="company_id"
            name="company_id"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className={inputClass}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id} className="bg-[var(--select-option-bg)]">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Data
        </label>
        <input
          type="date"
          id="date"
          name="date"
          defaultValue={todayISO()}
          required
          className="w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)]"
        />
      </div>

      <div>
        <label htmlFor="hours" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Ore
        </label>
        <input
          type="number"
          id="hours"
          name="hours"
          step={0.5}
          min={0.5}
          max={24}
          required
          value={hours || ''}
          onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
          className="w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)]"
        />
        {hours > 0 && (
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Costo stimato:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(estimatedCost)}
            </span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          className="w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)] resize-none"
        />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Note (opzionale)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--btn-primary-bg)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
      >
        {pending ? 'Salvataggio...' : 'Registra ore'}
      </button>
    </form>
  );
}
