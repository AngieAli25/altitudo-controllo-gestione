import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatCurrency, formatDate, formatHours } from '@/lib/utils';
import MetricCard from '@/components/MetricCard';
import MonthlyChart from './MonthlyChart';

export default async function DashboardPage() {
  const profile = await requireAuth();
  const supabase = await createClient();
  const isAdmin = profile.role === 'admin';

  if (isAdmin) {
    // Fetch all work entries
    const { data: workEntries } = await supabase
      .from('work_entries')
      .select('*, companies(name)')
      .order('created_at', { ascending: false });

    // Fetch all expense entries
    const { data: expenseEntries } = await supabase
      .from('expense_entries')
      .select('*, companies(name)')
      .order('created_at', { ascending: false });

    // Fetch all revenue entries
    const { data: revenueEntries } = await supabase
      .from('revenue_entries')
      .select('*, companies(name)')
      .order('created_at', { ascending: false });

    const allWork = workEntries ?? [];
    const allExpenses = expenseEntries ?? [];
    const allRevenue = revenueEntries ?? [];

    // Calculate totals per company
    const guidaevaiWork = allWork.filter(
      (e) => e.companies?.name?.toLowerCase() === 'guidaevai'
    );
    const reddoakWork = allWork.filter(
      (e) => e.companies?.name?.toLowerCase() === 'reddoak'
    );
    const guidaevaiExpenses = allExpenses.filter(
      (e) => e.companies?.name?.toLowerCase() === 'guidaevai'
    );
    const reddoakExpenses = allExpenses.filter(
      (e) => e.companies?.name?.toLowerCase() === 'reddoak'
    );

    const costoGuidaevai =
      guidaevaiWork.reduce((sum, e) => sum + (e.cost ?? e.hours * e.hourly_rate), 0) +
      guidaevaiExpenses.reduce((sum, e) => sum + e.amount, 0);

    const costoReddoak =
      reddoakWork.reduce((sum, e) => sum + (e.cost ?? e.hours * e.hourly_rate), 0) +
      reddoakExpenses.reduce((sum, e) => sum + e.amount, 0);

    const oreTotali = allWork.reduce((sum, e) => sum + e.hours, 0);
    const speseTotali = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const incassiTotali = allRevenue
      .filter((e) => e.status !== 'cancelled')
      .reduce((sum, e) => sum + e.amount, 0);

    // Monthly chart data
    const monthlyMap = new Map<string, { guidaevai: number; reddoak: number }>();
    for (const e of allWork) {
      const month = e.date.slice(0, 7); // yyyy-MM
      const entry = monthlyMap.get(month) ?? { guidaevai: 0, reddoak: 0 };
      const cost = e.cost ?? e.hours * e.hourly_rate;
      if (e.companies?.name?.toLowerCase() === 'guidaevai') {
        entry.guidaevai += cost;
      } else if (e.companies?.name?.toLowerCase() === 'reddoak') {
        entry.reddoak += cost;
      }
      monthlyMap.set(month, entry);
    }
    for (const e of allExpenses) {
      const month = e.date.slice(0, 7);
      const entry = monthlyMap.get(month) ?? { guidaevai: 0, reddoak: 0 };
      if (e.companies?.name?.toLowerCase() === 'guidaevai') {
        entry.guidaevai += e.amount;
      } else if (e.companies?.name?.toLowerCase() === 'reddoak') {
        entry.reddoak += e.amount;
      }
      monthlyMap.set(month, entry);
    }

    const monthlyData = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({
        month,
        guidaevai: Math.round(values.guidaevai * 100) / 100,
        reddoak: Math.round(values.reddoak * 100) / 100,
      }));

    // Last 10 entries (merge work + expense + revenue, sort by created_at desc)
    type MergedEntry = {
      id: string;
      type: 'ore' | 'spesa' | 'incasso';
      date: string;
      description: string;
      value: string;
      company: string;
      created_at: string;
    };

    const mergedEntries: MergedEntry[] = [
      ...allWork.map((e) => ({
        id: e.id,
        type: 'ore' as const,
        date: e.date,
        description: e.description,
        value: formatHours(e.hours),
        company: e.companies?.name ?? '-',
        created_at: e.created_at,
      })),
      ...allExpenses.map((e) => ({
        id: e.id,
        type: 'spesa' as const,
        date: e.date,
        description: e.description,
        value: formatCurrency(e.amount),
        company: e.companies?.name ?? '-',
        created_at: e.created_at,
      })),
      ...allRevenue.map((e) => ({
        id: e.id,
        type: 'incasso' as const,
        date: e.date,
        description: e.description,
        value: formatCurrency(e.amount),
        company: e.companies?.name ?? '-',
        created_at: e.created_at,
      })),
    ]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10);

    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>

        <div className="grid grid-cols-5 gap-6">
          <MetricCard title="Totale costi Guidaevai" value={formatCurrency(costoGuidaevai)} />
          <MetricCard title="Totale costi Reddoak" value={formatCurrency(costoReddoak)} />
          <MetricCard title="Ore totali" value={formatHours(oreTotali)} />
          <MetricCard title="Spese totali" value={formatCurrency(speseTotali)} />
          <MetricCard title="Incassi totali" value={formatCurrency(incassiTotali)} />
        </div>

        <MonthlyChart data={monthlyData} />

        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6">
          <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-4">Ultime registrazioni</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 px-2 font-medium">Tipo</th>
                  <th className="text-left py-3 px-2 font-medium">Data</th>
                  <th className="text-left py-3 px-2 font-medium">Descrizione</th>
                  <th className="text-left py-3 px-2 font-medium">Valore</th>
                  <th className="text-left py-3 px-2 font-medium">Azienda</th>
                </tr>
              </thead>
              <tbody>
                {mergedEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[var(--border-muted)] text-[var(--text-primary)]"
                  >
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.type === 'ore'
                            ? 'bg-blue-500/20 text-blue-300'
                            : entry.type === 'incasso'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-orange-500/20 text-orange-300'
                        }`}
                      >
                        {entry.type === 'ore' ? 'Ore' : entry.type === 'incasso' ? 'Incasso' : 'Spesa'}
                      </span>
                    </td>
                    <td className="py-3 px-2">{formatDate(entry.date)}</td>
                    <td className="py-3 px-2 max-w-xs truncate">{entry.description}</td>
                    <td className="py-3 px-2 font-medium text-[var(--text-primary)]">{entry.value}</td>
                    <td className="py-3 px-2">{entry.company}</td>
                  </tr>
                ))}
                {mergedEntries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                      Nessuna registrazione
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ---- USER VIEW ----

  const { data: workEntries } = await supabase
    .from('work_entries')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  const { data: expenseEntries } = await supabase
    .from('expense_entries')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  const { data: revenueEntries } = await supabase
    .from('revenue_entries')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false });

  const myWork = workEntries ?? [];
  const myExpenses = expenseEntries ?? [];
  const myRevenue = (revenueEntries ?? []).filter((e) => e.status !== 'cancelled');

  const oreInserite = myWork.reduce((sum, e) => sum + e.hours, 0);
  const costoOre = myWork.reduce((sum, e) => sum + (e.cost ?? e.hours * e.hourly_rate), 0);
  const speseSostenute = myExpenses.reduce((sum, e) => sum + e.amount, 0);
  const incassiAzienda = myRevenue.reduce((sum, e) => sum + e.amount, 0);

  type MergedEntry = {
    id: string;
    type: 'ore' | 'spesa' | 'incasso';
    date: string;
    description: string;
    value: string;
    created_at: string;
  };

  const recentEntries: MergedEntry[] = [
    ...myWork.map((e) => ({
      id: e.id,
      type: 'ore' as const,
      date: e.date,
      description: e.description,
      value: formatHours(e.hours),
      created_at: e.created_at,
    })),
    ...myExpenses.map((e) => ({
      id: e.id,
      type: 'spesa' as const,
      date: e.date,
      description: e.description,
      value: formatCurrency(e.amount),
      created_at: e.created_at,
    })),
    ...myRevenue.map((e) => ({
      id: e.id,
      type: 'incasso' as const,
      date: e.date,
      description: e.description,
      value: formatCurrency(e.amount),
      created_at: e.created_at,
    })),
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
        <MetricCard title="Ore inserite" value={formatHours(oreInserite)} />
        <MetricCard title="Costo ore" value={formatCurrency(costoOre)} />
        <MetricCard title="Spese sostenute" value={formatCurrency(speseSostenute)} />
        <MetricCard title="Incassi" value={formatCurrency(incassiAzienda)} />
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6">
        <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-4">Le tue ultime registrazioni</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                <th className="text-left py-3 px-2 font-medium">Tipo</th>
                <th className="text-left py-3 px-2 font-medium">Data</th>
                <th className="text-left py-3 px-2 font-medium">Descrizione</th>
                <th className="text-left py-3 px-2 font-medium">Valore</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[var(--border-muted)] text-[var(--text-primary)]"
                >
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.type === 'ore'
                          ? 'bg-blue-500/20 text-blue-300'
                          : entry.type === 'incasso'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-orange-500/20 text-orange-300'
                      }`}
                    >
                      {entry.type === 'ore' ? 'Ore' : entry.type === 'incasso' ? 'Incasso' : 'Spesa'}
                    </span>
                  </td>
                  <td className="py-3 px-2">{formatDate(entry.date)}</td>
                  <td className="py-3 px-2 max-w-xs truncate">{entry.description}</td>
                  <td className="py-3 px-2 font-medium text-[var(--text-primary)]">{entry.value}</td>
                </tr>
              ))}
              {recentEntries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[var(--text-muted)]">
                    Nessuna registrazione
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
