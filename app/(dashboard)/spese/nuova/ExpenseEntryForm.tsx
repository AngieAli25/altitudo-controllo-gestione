'use client';

import { useActionState, useState, useCallback } from 'react';
import { createExpenseEntry } from '@/lib/actions';
import { todayISO } from '@/lib/utils';

const categories = [
  { value: 'fattura', label: 'Fattura' },
  { value: 'acquisto', label: 'Acquisto' },
  { value: 'rimborso', label: 'Rimborso' },
  { value: 'altro', label: 'Altro' },
];

interface Props {
  isAdmin: boolean;
  users: { id: string; full_name: string; company_id: string }[];
  companies: { id: string; name: string }[];
  currentUserId: string;
  currentCompanyId: string;
}

export default function ExpenseEntryForm({ isAdmin, users, companies, currentUserId, currentCompanyId }: Props) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(currentCompanyId);
  const [state, formAction, pending] = useActionState(createExpenseEntry, null);

  const handleUserChange = useCallback((userId: string) => {
    const selectedUser = users.find((u) => u.id === userId);
    if (selectedUser) {
      setSelectedCompanyId(selectedUser.company_id);
    }
  }, [users]);

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
        <input type="date" id="date" name="date" defaultValue={todayISO()} required className={inputClass} />
      </div>

      <div>
        <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Importo (&euro;)
        </label>
        <input type="number" id="amount" name="amount" step={0.01} min={0.01} required className={inputClass} />
      </div>

      <div>
        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Categoria
        </label>
        <select id="category" name="category" required className={inputClass}>
          <option value="">Seleziona categoria</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value} className="bg-[var(--select-option-bg)]">
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Descrizione
        </label>
        <textarea id="description" name="description" rows={3} required className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label htmlFor="attachment_name" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Nome allegato (opzionale)
        </label>
        <input type="text" id="attachment_name" name="attachment_name" className={inputClass} />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Note (opzionale)
        </label>
        <textarea id="notes" name="notes" rows={2} className={`${inputClass} resize-none`} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--btn-primary-bg)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:opacity-50 cursor-pointer"
      >
        {pending ? 'Salvataggio...' : 'Registra spesa'}
      </button>
    </form>
  );
}
