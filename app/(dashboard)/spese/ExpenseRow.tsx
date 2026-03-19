'use client';

import { useState, useTransition } from 'react';
import { updateExpenseEntry, deleteExpenseEntry } from '@/lib/actions';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';

const categories = [
  { value: 'fattura', label: 'Fattura' },
  { value: 'acquisto', label: 'Acquisto' },
  { value: 'rimborso', label: 'Rimborso' },
  { value: 'altro', label: 'Altro' },
];

const categoryLabels: Record<string, string> = {
  fattura: 'Fattura',
  acquisto: 'Acquisto',
  rimborso: 'Rimborso',
  altro: 'Altro',
};

interface ExpenseRowProps {
  entry: {
    id: string;
    date: string;
    amount: number;
    category: string;
    description: string;
    attachment_name: string | null;
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

export default function ExpenseRow({ entry, isAdmin, canEdit, users, companies }: ExpenseRowProps) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(entry.date);
  const [amount, setAmount] = useState(entry.amount.toString());
  const [category, setCategory] = useState(entry.category);
  const [description, setDescription] = useState(entry.description);
  const [attachmentName, setAttachmentName] = useState(entry.attachment_name ?? '');
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
    formData.set('amount', amount);
    formData.set('category', category);
    formData.set('description', description);
    formData.set('attachment_name', attachmentName);
    formData.set('notes', notes);
    if (isAdmin) {
      formData.set('assigned_user_id', assignedUserId);
      formData.set('company_id', companyId);
    }

    startTransition(async () => {
      const result = await updateExpenseEntry(formData);
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
    setAmount(entry.amount.toString());
    setCategory(entry.category);
    setDescription(entry.description);
    setAttachmentName(entry.attachment_name ?? '');
    setNotes(entry.notes ?? '');
    setAssignedUserId(entry.user_id);
    setCompanyId(entry.company_id);
    setError(null);
  }

  function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questa spesa?')) return;
    setError(null);
    const formData = new FormData();
    formData.set('id', entry.id);

    startTransition(async () => {
      const result = await deleteExpenseEntry(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (!editing) {
    return (
      <tr className="border-b border-[var(--border-muted)] hover:bg-[var(--bg-surface-hover)]">
        <td className="px-4 py-3 text-[var(--text-primary)]">{formatDate(entry.date)}</td>
        <td className="px-4 py-3 text-[var(--text-primary)]">{entry.profiles?.full_name ?? '—'}</td>
        <td className="px-4 py-3 text-[var(--text-primary)]">
          {companies.find((c) => c.id === entry.company_id)?.name ?? '—'}
        </td>
        <td className="px-4 py-3 text-[var(--text-primary)]">{categoryLabels[entry.category] ?? entry.category}</td>
        <td className="px-4 py-3 text-[var(--text-primary)] text-right">{formatCurrency(entry.amount)}</td>
        <td className="px-4 py-3 text-[var(--text-primary)] max-w-xs truncate">{entry.description}</td>
        <td className="px-4 py-3 text-[var(--text-secondary)]">{entry.attachment_name ?? '—'}</td>
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
          {isAdmin ? (
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={inputClass}>
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-[var(--select-option-bg)]">
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[var(--text-primary)] text-sm">
              {companies.find((c) => c.id === entry.company_id)?.name ?? '—'}
            </span>
          )}
        </td>
        <td className="px-4 py-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {categories.map((c) => (
              <option key={c.value} value={c.value} className="bg-[var(--select-option-bg)]">
                {c.label}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-2">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputClass} w-24 text-right`}
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
        <td className="px-4 py-2">
          <input
            type="text"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
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
          <td colSpan={9} className="px-4 pb-2">
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          </td>
        </tr>
      )}
    </>
  );
}
