'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createRevenueEntry } from '@/lib/actions';
import { todayISO } from '@/lib/utils';

const sourceOptions = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'bonifico', label: 'Bonifico' },
  { value: 'contanti', label: 'Contanti' },
  { value: 'altro', label: 'Altro' },
];

const statusOptions = [
  { value: 'confirmed', label: 'Confermato' },
  { value: 'pending', label: 'In attesa' },
  { value: 'cancelled', label: 'Annullato' },
];

interface Props {
  isAdmin: boolean;
  users: { id: string; full_name: string; company_id: string }[];
  companies: { id: string; name: string }[];
  currentUserId: string;
  currentCompanyId: string;
}

export default function RevenueEntryForm({ isAdmin, users, companies, currentUserId, currentCompanyId }: Props) {
  const [source, setSource] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(currentCompanyId);
  const [state, formAction, pending] = useActionState(createRevenueEntry, null);

  const inputClass =
    'w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[rgba(255,255,255,0.40)]';
  const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--text-secondary)]';

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {isAdmin && (
        <div>
          <label htmlFor="assigned_user_id" className={labelClass}>
            Assegna a
          </label>
          <select
            id="assigned_user_id"
            name="assigned_user_id"
            defaultValue={currentUserId}
            onChange={(e) => {
              const selectedUser = users.find((u) => u.id === e.target.value);
              if (selectedUser) setSelectedCompanyId(selectedUser.company_id);
            }}
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
          <label htmlFor="company_id" className={labelClass}>
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
        <label htmlFor="date" className={labelClass}>
          Data
        </label>
        <input
          type="date"
          id="date"
          name="date"
          defaultValue={todayISO()}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="amount" className={labelClass}>
          Importo (&euro;)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          step={0.01}
          min={0.01}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label htmlFor="source" className={labelClass}>
          Fonte
        </label>
        <select
          id="source"
          name="source"
          required
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={inputClass}
        >
          <option value="" className="bg-[var(--select-option-bg)]">Seleziona fonte</option>
          {sourceOptions.map((s) => (
            <option key={s.value} value={s.value} className="bg-[var(--select-option-bg)]">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="client_name" className={labelClass}>
          Nome cliente (opzionale)
        </label>
        <input
          type="text"
          id="client_name"
          name="client_name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="invoice_number" className={labelClass}>
          Numero fattura (opzionale)
        </label>
        <input
          type="text"
          id="invoice_number"
          name="invoice_number"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Stato
        </label>
        <select
          id="status"
          name="status"
          defaultValue="confirmed"
          className={inputClass}
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value} className="bg-[var(--select-option-bg)]">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stripe fields - shown only when source is stripe */}
      {source === 'stripe' && (
        <div className="space-y-5 rounded-xl border border-[var(--border-subtle)] p-4">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Dettagli Stripe</p>

          <div>
            <label htmlFor="stripe_payment_id" className={labelClass}>
              Stripe Payment ID
            </label>
            <input
              type="text"
              id="stripe_payment_id"
              name="stripe_payment_id"
              placeholder="pi_..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="stripe_invoice_id" className={labelClass}>
              Stripe Invoice ID
            </label>
            <input
              type="text"
              id="stripe_invoice_id"
              name="stripe_invoice_id"
              placeholder="in_..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="stripe_customer_id" className={labelClass}>
              Stripe Customer ID
            </label>
            <input
              type="text"
              id="stripe_customer_id"
              name="stripe_customer_id"
              placeholder="cus_..."
              className={inputClass}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="notes" className={labelClass}>
          Note (opzionale)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--btn-primary-bg)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
      >
        {pending ? 'Salvataggio...' : 'Registra incasso'}
      </button>
    </form>
  );
}
