'use client';

import { useActionState } from 'react';
import { createUserAction } from '@/lib/actions';

interface CreateUserFormProps {
  companies: { id: string; name: string }[];
}

export default function CreateUserForm({ companies }: CreateUserFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createUserAction(formData);
      return result ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6 max-w-lg">
      {state?.error && (
        <div className="bg-[rgba(255,80,80,0.10)] border border-[rgba(255,80,80,0.30)] rounded-xl px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="full_name" className="block text-sm text-[var(--text-secondary)] uppercase tracking-wider">
          Nome completo
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-3 outline-none focus:border-[var(--text-secondary)] transition-colors placeholder:text-[var(--text-placeholder)]"
          placeholder="Mario Rossi"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm text-[var(--text-secondary)] uppercase tracking-wider">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-3 outline-none focus:border-[var(--text-secondary)] transition-colors placeholder:text-[var(--text-placeholder)]"
          placeholder="mario@esempio.it"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm text-[var(--text-secondary)] uppercase tracking-wider">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-3 outline-none focus:border-[var(--text-secondary)] transition-colors placeholder:text-[var(--text-placeholder)]"
          placeholder="Minimo 6 caratteri"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="company_id" className="block text-sm text-[var(--text-secondary)] uppercase tracking-wider">
          Azienda
        </label>
        <select
          id="company_id"
          name="company_id"
          required
          className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-3 outline-none focus:border-[var(--text-secondary)] transition-colors"
        >
          <option value="" className="bg-[var(--select-option-bg)]">Seleziona azienda</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id} className="bg-[var(--select-option-bg)]">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="block text-sm text-[var(--text-secondary)] uppercase tracking-wider">
          Ruolo
        </label>
        <select
          id="role"
          name="role"
          required
          className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-3 outline-none focus:border-[var(--text-secondary)] transition-colors"
        >
          <option value="user" className="bg-[var(--select-option-bg)]">User</option>
          <option value="admin" className="bg-[var(--select-option-bg)]">Admin</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="hourly_rate" className="block text-sm text-[var(--text-secondary)] uppercase tracking-wider">
          Tariffa oraria (&euro;)
        </label>
        <input
          id="hourly_rate"
          name="hourly_rate"
          type="number"
          step="0.01"
          min="0"
          required
          className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-3 outline-none focus:border-[var(--text-secondary)] transition-colors placeholder:text-[var(--text-placeholder)]"
          placeholder="0.00"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-full px-8 py-3 text-sm uppercase tracking-wider font-medium hover:bg-[var(--btn-primary-hover)] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'Creazione...' : 'Crea utente'}
      </button>
    </form>
  );
}
