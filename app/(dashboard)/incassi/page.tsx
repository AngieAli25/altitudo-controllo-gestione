import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatDate, formatDateTime, formatCurrency, getMonthOptions } from '@/lib/utils';
import IncassiFilters from './IncassiFilters';

export default async function IncassiPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; source?: string; user_id?: string }>;
}) {
  const query = await searchParams;
  const profile = await requireAuth();
  const supabase = await createClient();
  const isAdmin = profile.role === 'admin';

  let dbQuery = supabase
    .from('revenue_entries')
    .select('*, profiles(full_name), companies(name)')
    .order('date', { ascending: false });

  // Month filter
  if (query.month) {
    const [year, month] = query.month.split('-').map(Number);
    const startDate = `${query.month}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    dbQuery = dbQuery.gte('date', startDate).lte('date', endDate);
  }

  // Source filter
  if (query.source) {
    dbQuery = dbQuery.eq('source', query.source);
  }

  // User filter (admin only)
  if (query.user_id && isAdmin) {
    dbQuery = dbQuery.eq('user_id', query.user_id);
  }

  // Non-admin sees only their company's entries
  if (!isAdmin) {
    dbQuery = dbQuery.eq('company_id', profile.company_id);
  }

  const { data: entries } = await dbQuery;

  // Get users list for admin filter
  let users: { id: string; full_name: string }[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name');
    users = data ?? [];
  }

  const months = getMonthOptions();

  const totalAmount = (entries ?? []).reduce((sum, e) => sum + e.amount, 0);

  const sourceLabels: Record<string, string> = {
    stripe: 'Stripe',
    bonifico: 'Bonifico',
    contanti: 'Contanti',
    altro: 'Altro',
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'In attesa', className: 'bg-yellow-500/20 text-yellow-300' },
    confirmed: { label: 'Confermato', className: 'bg-green-500/20 text-green-300' },
    cancelled: { label: 'Annullato', className: 'bg-red-500/20 text-red-300' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Incassi</h1>
        <Link
          href="/incassi/nuovo"
          className="inline-flex items-center justify-center rounded-full bg-[var(--btn-primary-bg)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
        >
          Nuovo incasso
        </Link>
      </div>

      <IncassiFilters
        months={months}
        users={isAdmin ? users : undefined}
        currentMonth={query.month}
        currentSource={query.source}
        currentUserId={query.user_id}
        isAdmin={isAdmin}
      />

      <div className="overflow-hidden rounded-2xl bg-[var(--bg-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Data</th>
                <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Persona</th>
                <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Cliente</th>
                <th className="px-4 py-3 font-medium text-[var(--text-muted)] text-right">Importo (&euro;)</th>
                <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Fonte</th>
                <th className="px-4 py-3 font-medium text-[var(--text-muted)]">N. Fattura</th>
                <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Stato</th>
                <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Descrizione</th>
                <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Inserito il</th>
              </tr>
            </thead>
            <tbody>
              {(entries ?? []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Nessun incasso trovato
                  </td>
                </tr>
              ) : (
                (entries ?? []).map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[var(--border-muted)] hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)]">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">{entry.profiles?.full_name ?? '\u2014'}</td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">{entry.client_name ?? '\u2014'}</td>
                    <td className="px-4 py-3 text-[var(--text-primary)] text-right">{formatCurrency(entry.amount)}</td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {sourceLabels[entry.source] ?? entry.source}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{entry.invoice_number ?? '\u2014'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusConfig[entry.status]?.className ?? ''
                        }`}
                      >
                        {statusConfig[entry.status]?.label ?? entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)] max-w-xs truncate">{entry.description}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {formatDateTime(entry.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {(entries ?? []).length > 0 && (
              <tfoot>
                <tr className="border-t border-[var(--border-default)]">
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">Totale</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)] text-right">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
