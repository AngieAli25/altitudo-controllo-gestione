import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatCurrency, getMonthOptions } from '@/lib/utils';
import OreFilters from './OreFilters';
import WorkRow from './WorkRow';

export default async function OrePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; user_id?: string }>;
}) {
  const query = await searchParams;
  const profile = await requireAuth();
  const supabase = await createClient();
  const isAdmin = profile.role === 'admin';

  // Build query
  let dbQuery = supabase
    .from('work_entries')
    .select('*, profiles(full_name), companies(name)')
    .order('date', { ascending: false });

  // Month filter
  if (query.month) {
    const [year, month] = query.month.split('-').map(Number);
    const startDate = `${query.month}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    dbQuery = dbQuery.gte('date', startDate).lte('date', endDate);
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

  // Get companies (for all users) and users (admin only)
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

  const totalHours = (entries ?? []).reduce((sum, e) => sum + e.hours, 0);
  const totalCost = (entries ?? []).reduce((sum, e) => sum + (e.cost ?? e.hours * e.hourly_rate), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Ore lavorate</h1>
        <Link
          href="/ore/nuova"
          className="inline-flex items-center justify-center rounded-full bg-[var(--btn-primary-bg)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
        >
          Nuova registrazione
        </Link>
      </div>

      <OreFilters
        months={months}
        users={isAdmin ? users : undefined}
        currentMonth={query.month}
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
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-right">Ore</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Descrizione</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-right">Costo (&euro;)</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Note</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Inserita il</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {(entries ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Nessuna registrazione trovata
                  </td>
                </tr>
              ) : (
                (entries ?? []).map((entry) => (
                  <WorkRow
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
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)] text-right">
                    {totalHours.toFixed(1)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)] text-right">
                    {formatCurrency(totalCost)}
                  </td>
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
