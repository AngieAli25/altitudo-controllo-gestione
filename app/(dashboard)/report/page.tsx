import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatHours, getMonthOptions } from '@/lib/utils';
import { format } from 'date-fns';
import CompanyBadge from '@/components/CompanyBadge';
import ReportFilters from './ReportFilters';
import ExportCSV from './ExportCSV';

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function ReportPage({ searchParams }: Props) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;
  const month = params.month || format(new Date(), 'yyyy-MM');
  const monthStart = `${month}-01`;
  const [year, mon] = month.split('-').map(Number);
  const nextMonth = new Date(year, mon, 1);
  const monthEnd = format(nextMonth, 'yyyy-MM-dd');

  const months = getMonthOptions();

  // Fetch work entries for the month
  const { data: workEntries } = await supabase
    .from('work_entries')
    .select('*, profiles!inner(full_name, company_id), companies!inner(name)')
    .gte('date', monthStart)
    .lt('date', monthEnd);

  // Fetch expense entries for the month
  const { data: expenseEntries } = await supabase
    .from('expense_entries')
    .select('*, profiles!inner(full_name, company_id), companies!inner(name)')
    .gte('date', monthStart)
    .lt('date', monthEnd);

  // Fetch revenue entries for the month (exclude cancelled)
  const { data: revenueEntries } = await supabase
    .from('revenue_entries')
    .select('*, profiles!inner(full_name, company_id), companies!inner(name)')
    .gte('date', monthStart)
    .lt('date', monthEnd)
    .neq('status', 'cancelled');

  // Aggregate per person
  const personMap = new Map<
    string,
    {
      name: string;
      company: string;
      hours: number;
      hoursCost: number;
      expenses: number;
      revenue: number;
    }
  >();

  for (const entry of workEntries ?? []) {
    const key = entry.user_id;
    const existing = personMap.get(key) ?? {
      name: entry.profiles.full_name,
      company: entry.companies.name,
      hours: 0,
      hoursCost: 0,
      expenses: 0,
      revenue: 0,
    };
    existing.hours += entry.hours;
    existing.hoursCost += entry.hours * entry.hourly_rate;
    personMap.set(key, existing);
  }

  for (const entry of expenseEntries ?? []) {
    const key = entry.user_id;
    const existing = personMap.get(key) ?? {
      name: entry.profiles.full_name,
      company: entry.companies.name,
      hours: 0,
      hoursCost: 0,
      expenses: 0,
      revenue: 0,
    };
    existing.expenses += entry.amount;
    personMap.set(key, existing);
  }

  for (const entry of revenueEntries ?? []) {
    const key = entry.user_id;
    const existing = personMap.get(key) ?? {
      name: entry.profiles.full_name,
      company: entry.companies.name,
      hours: 0,
      hoursCost: 0,
      expenses: 0,
      revenue: 0,
    };
    existing.revenue += entry.amount;
    personMap.set(key, existing);
  }

  const people = Array.from(personMap.values()).map((p) => ({
    ...p,
    total: p.hoursCost + p.expenses,
  }));

  const companies = ['Guidaevai', 'Reddoak'] as const;

  const companyData = companies.map((companyName) => {
    const companyPeople = people.filter((p) => p.company === companyName);
    const totaleOre = companyPeople.reduce((acc, p) => acc + p.hours, 0);
    const costoOre = companyPeople.reduce((acc, p) => acc + p.hoursCost, 0);
    const totaleSpese = companyPeople.reduce((acc, p) => acc + p.expenses, 0);
    const costoTotale = costoOre + totaleSpese;
    const totaleIncassi = companyPeople.reduce((acc, p) => acc + p.revenue, 0);
    const bilancio = totaleIncassi - costoTotale;
    return { companyName, companyPeople, totaleOre, costoOre, totaleSpese, costoTotale, totaleIncassi, bilancio };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Report</h1>
        <div className="flex items-center gap-4">
          <ReportFilters months={months} currentMonth={month} />
          <ExportCSV data={people} month={month} />
        </div>
      </div>

      {companyData.map((cd) => (
        <div
          key={cd.companyName}
          className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6 space-y-6"
        >
          {/* Company header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CompanyBadge company={cd.companyName} />
              <h2 className="text-lg font-medium text-[var(--text-primary)]">{cd.companyName}</h2>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Totale ore lavorate
              </p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{formatHours(cd.totaleOre)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Costo ore
              </p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(cd.costoOre)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Totale spese vive
              </p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(cd.totaleSpese)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Costo totale
              </p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(cd.costoTotale)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Totale incassi
              </p>
              <p className="text-xl font-semibold text-green-400">{formatCurrency(cd.totaleIncassi)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Bilancio
              </p>
              <p className={`text-xl font-semibold ${cd.bilancio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(cd.bilancio)}
              </p>
            </div>
          </div>

          {/* Breakdown table */}
          {cd.companyPeople.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-2">
                      Nome
                    </th>
                    <th className="text-right text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-2">
                      Ore
                    </th>
                    <th className="text-right text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-2">
                      Costo ore
                    </th>
                    <th className="text-right text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-2">
                      Spese
                    </th>
                    <th className="text-right text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-2">
                      Incassi
                    </th>
                    <th className="text-right text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-2">
                      Totale costi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cd.companyPeople.map((person) => (
                    <tr
                      key={person.name}
                      className="border-b border-[var(--border-muted)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                    >
                      <td className="py-3 px-2 text-[var(--text-primary)]">{person.name}</td>
                      <td className="py-3 px-2 text-right text-[var(--text-secondary)]">
                        {formatHours(person.hours)}
                      </td>
                      <td className="py-3 px-2 text-right text-[var(--text-secondary)]">
                        {formatCurrency(person.hoursCost)}
                      </td>
                      <td className="py-3 px-2 text-right text-[var(--text-secondary)]">
                        {formatCurrency(person.expenses)}
                      </td>
                      <td className="py-3 px-2 text-right text-green-400">
                        {formatCurrency(person.revenue)}
                      </td>
                      <td className="py-3 px-2 text-right text-[var(--text-primary)] font-medium">
                        {formatCurrency(person.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">Nessun dato per questo periodo.</p>
          )}
        </div>
      ))}
    </div>
  );
}
