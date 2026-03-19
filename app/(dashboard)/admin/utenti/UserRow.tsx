'use client';

import { useState, useTransition } from 'react';
import { updateUserAction, disableUserAction } from '@/lib/actions';
import CompanyBadge from '@/components/CompanyBadge';

interface UserRowProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    company_id: string;
    company_name: string;
    role: string;
    hourly_rate: number;
  };
  companies: { id: string; name: string }[];
}

export default function UserRow({ user, companies }: UserRowProps) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [companyId, setCompanyId] = useState(user.company_id);
  const [role, setRole] = useState(user.role);
  const [hourlyRate, setHourlyRate] = useState(user.hourly_rate.toString());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    'bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg px-2 py-1 text-sm outline-none focus:border-[var(--text-secondary)] transition-colors';

  function handleSave() {
    setError(null);
    const formData = new FormData();
    formData.set('user_id', user.id);
    formData.set('full_name', fullName);
    formData.set('email', email);
    formData.set('company_id', companyId);
    formData.set('role', role);
    formData.set('hourly_rate', hourlyRate);

    startTransition(async () => {
      const result = await updateUserAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  function handleCancel() {
    setEditing(false);
    setFullName(user.full_name);
    setEmail(user.email);
    setCompanyId(user.company_id);
    setRole(user.role);
    setHourlyRate(user.hourly_rate.toString());
    setError(null);
  }

  function handleDisable() {
    if (!confirm(`Sei sicuro di voler disabilitare ${user.full_name}?`)) return;
    setError(null);
    const formData = new FormData();
    formData.set('user_id', user.id);

    startTransition(async () => {
      const result = await disableUserAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <tr className="border-b border-[var(--border-muted)] hover:bg-[var(--bg-surface-hover)] transition-colors">
        {/* Nome */}
        <td className="py-3 px-3">
          {editing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${inputClass} w-36`}
            />
          ) : (
            <span className="text-[var(--text-primary)]">{user.full_name}</span>
          )}
        </td>

        {/* Email */}
        <td className="py-3 px-3">
          {editing ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} w-48`}
            />
          ) : (
            <span className="text-[var(--text-secondary)] text-sm">{user.email}</span>
          )}
        </td>

        {/* Azienda */}
        <td className="py-3 px-3">
          {editing ? (
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className={`${inputClass}`}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-[var(--select-option-bg)]">
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <CompanyBadge company={user.company_name} />
          )}
        </td>

        {/* Ruolo */}
        <td className="py-3 px-3">
          {editing ? (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputClass}`}
            >
              <option value="admin" className="bg-[var(--select-option-bg)]">admin</option>
              <option value="user" className="bg-[var(--select-option-bg)]">user</option>
            </select>
          ) : (
            <span className="text-[var(--text-secondary)] text-sm capitalize">{user.role}</span>
          )}
        </td>

        {/* Tariffa oraria */}
        <td className="py-3 px-3">
          {editing ? (
            <input
              type="number"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className={`${inputClass} w-24`}
            />
          ) : (
            <span className="text-[var(--text-secondary)] text-sm">
              {Number(user.hourly_rate).toFixed(2)} &euro;/h
            </span>
          )}
        </td>

        {/* Azioni */}
        <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-green-400 rounded-full px-3 py-1 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Salvo...' : 'Salva'}
                </button>
                <button
                  onClick={handleCancel}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Annulla
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] rounded-full px-3 py-1 transition-colors cursor-pointer"
                >
                  Modifica
                </button>
                <button
                  onClick={handleDisable}
                  disabled={isPending}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Disabilita
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={6} className="px-3 pb-2">
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          </td>
        </tr>
      )}
    </>
  );
}
