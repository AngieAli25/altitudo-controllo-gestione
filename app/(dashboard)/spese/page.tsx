import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatCurrency, getMonthOptions } from '@/lib/utils';
import SpeseFilters from './SpeseFilters';
import ExpenseRow from './ExpenseRow';

export default async function SpesePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; category?: string; user_id?: string }>;
}) {
  const query = await searchParams;
  const profile = await requireAuth();
  const supabase = await createClient();
  const isAdmin = profile.role === 'admin';

  let dbQuery = supabase
    .from('expense_entries')
    .select('*, profiles(full_name), companies(name)')
    .order('date', { ascending: false });

  if (query.month) {
    const [year, month] = query.month.split('-').map(Number);
    const startDate = `${query.month}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    dbQuery = dbQuery.gte('date', startDate).lte('date', endDate);
  }

  if (query.category) {
    dbQuery = dbQuery.eq('category', query.category);
  }

  if (query.user_id && isAdmin) {
    dbQuery = dbQuery.eq('user_id', query.user_id);
  }

  if (!isAdmin) {
    dbQuery = dbQuery.eq('company_id', profile.company_id);
  }

  const { data: entries } = await dbQuery;

  // Get companies (for all users to show company name) and users (admin only)
  const { data: companiesData } = await supabase.from('companies').select('id, name').order('name');
  const companies = companiesData ?? [];

  let users: { id: string; full_name: string; company_id: string }[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, company_id')
      .order('full_name');
    users = data ?? [];
  }

  const months = getMonthOptions();
  const totalAmount = (entries ?? []).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Spese</h1>
        <Link
          href="/spese/nuova"
          className="inline-flex items-center justify-center rounded-full bg-[var(--btn-primary-bg)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
        >
          Nuova spesa
        </Link>
      </div>

      <SpeseFilters
        months={months}
        users={isAdmin ? users : undefined}
        currentMonth={query.month}
        currentCategory={query.category}
        currentUserId={query.user_id}
        isAdmin={isAdmin}
      />

      <div className="overflow-hidden rounded-2xl bg-[var(--bg-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Data</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Persona</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Azienda</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Categoria</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-right">Importo (&euro;)</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Descrizione</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Allegato</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Inserita il</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {(entries ?? []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Nessuna spesa trovata
                  </td>
                </tr>
              ) : (
                (entries ?? []).map((entry) => (
                  <ExpenseRow
                    key={entry.id}
                    entry={entry}
                    isAdmin={isAdmin}
                    canEdit={isAdmin || entry.user_id === profile.id}
                    users={users}
                    companies={companies}
                  />
                ))
              )}
            </tbody>
            {(entries ?? []).length > 0 && (
              <tfoot>
                <tr className="border-t border-[var(--border-default)]">
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">Totale</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)] text-right">
                    {formatCurrency(totalAmount)}
                  </td>
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
