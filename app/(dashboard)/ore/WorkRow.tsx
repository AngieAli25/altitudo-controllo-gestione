'use client';

import { useState, useTransition } from 'react';
import { updateWorkEntry, deleteWorkEntry } from '@/lib/actions';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';

interface WorkRowProps {
  entry: {
    id: string;
    date: string;
    hours: number;
    description: string;
    hourly_rate: number;
    cost?: number;
    notes: string | null;
    user_id: string;
    company_id: string;
    created_at: string;
    profiles?: { full_name: string } | null;
  };
  isAdmin: boolean;
  canEdit: boolean;
  users: { id: string; full_name: string; company_id: string }[];
  companies: { id: string; name: string }[];
}

export default function WorkRow({ entry, isAdmin, canEdit, users, companies }: WorkRowProps) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(entry.date);
  const [hours, setHours] = useState(entry.hours.toString());
  const [description, setDescription] = useState(entry.description);
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [assignedUserId, setAssignedUserId] = useState(entry.user_id);
  const [companyId, setCompanyId] = useState(entry.company_id);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    'bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg px-2 py-1 text-sm outline-none focus:border-[var(--text-secondary)] transition-colors';

  function handleSave() {
    setError(null);
    const formData = new FormData();
    formData.set('id', entry.id);
    formData.set('date', date);
    formData.set('hours', hours);
    formData.set('description', description);
    formData.set('notes', notes);
    if (isAdmin) {
      formData.set('assigned_user_id', assignedUserId);
      formData.set('company_id', companyId);
    }

    startTransition(async () => {
      const result = await updateWorkEntry(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  function handleCancel() {
    setEditing(false);
    setDate(entry.date);
    setHours(entry.hours.toString());
    setDescription(entry.description);
    setNotes(entry.notes ?? '');
    setAssignedUserId(entry.user_id);
    setCompanyId(entry.company_id);
    setError(null);
  }

  function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questa registrazione?')) return;
    setError(null);
    const formData = new FormData();
    formData.set('id', entry.id);

    startTransition(async () => {
      const result = await deleteWorkEntry(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const cost = entry.cost ?? entry.hours * entry.hourly_rate;

  if (!editing) {
    return (
      <tr className="border-b border-[var(--border-muted)] hover:bg-[var(--bg-surface-hover)]">
        <td className="px-4 py-3 text-[var(--text-primary)]">{formatDate(entry.date)}</td>
        <td className="px-4 py-3 text-[var(--text-primary)]">{entry.profiles?.full_name ?? '—'}</td>
        <td className="px-4 py-3 text-[var(--text-primary)] text-right">{entry.hours.toFixed(1)}</td>
        <td className="px-4 py-3 text-[var(--text-primary)] max-w-xs truncate">{entry.description}</td>
        <td className="px-4 py-3 text-[var(--text-primary)] text-right">{formatCurrency(cost)}</td>
        <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[200px] truncate">{entry.notes ?? '—'}</td>
        <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDateTime(entry.created_at)}</td>
        <td className="px-4 py-3">
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] rounded-full px-3 py-1 transition-colors cursor-pointer"
              >
                Modifica
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Elimina
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="border-b border-[var(--border-muted)] bg-[var(--bg-surface-hover)]">
        <td className="px-4 py-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} w-32`} />
        </td>
        <td className="px-4 py-2">
          {isAdmin ? (
            <select value={assignedUserId} onChange={(e) => {
              setAssignedUserId(e.target.value);
              const selectedUser = users.find((u) => u.id === e.target.value);
              if (selectedUser) setCompanyId(selectedUser.company_id);
            }} className={inputClass}>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-[var(--select-option-bg)]">
                  {u.full_name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[var(--text-primary)] text-sm">{entry.profiles?.full_name ?? '—'}</span>
          )}
        </td>
        <td className="px-4 py-2">
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className={`${inputClass} w-20 text-right`}
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} w-full`}
          />
        </td>
        <td className="px-4 py-2 text-[var(--text-primary)] text-right text-sm">
          {formatCurrency(parseFloat(hours || '0') * entry.hourly_rate)}
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} w-full`}
            placeholder="—"
          />
        </td>
        <td className="px-4 py-2 text-[var(--text-secondary)] text-sm">{formatDateTime(entry.created_at)}</td>
        <td className="px-4 py-2">
          <div className="flex items-center gap-2">
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
          </div>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={8} className="px-4 pb-2">
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          </td>
        </tr>
      )}
    </>
  );
}
