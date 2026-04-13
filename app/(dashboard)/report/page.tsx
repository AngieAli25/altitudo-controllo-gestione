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

  // Aggregate per person
  const personMap = new Map<
    string,
    {
      name: string;
      company: string;
      hours: number;
      hoursCost: number;
      expenses: number;
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
    };
    existing.expenses += entry.amount;
    personMap.set(key, existing);
  }

  const people = Array.from(personMap.values()).map((p) => ({
    ...p,
    total: p.hoursCost + p.expenses,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Costo persone</h1>
        <div className="flex items-center gap-4">
          <ReportFilters months={months} currentMonth={month} />
          <ExportCSV data={people} month={month} />
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6">
        {people.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-2">
                    Nome
                  </th>
                  <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-2">
                    Azienda
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
                    Totale
                  </th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr
                    key={person.name}
                    className="border-b border-[var(--border-muted)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="py-3 px-2 text-[var(--text-primary)]">{person.name}</td>
                    <td className="py-3 px-2">
                      <CompanyBadge company={person.company} />
                    </td>
                    <td className="py-3 px-2 text-right text-[var(--text-secondary)]">
                      {formatHours(person.hours)}
                    </td>
                    <td className="py-3 px-2 text-right text-[var(--text-secondary)]">
                      {formatCurrency(person.hoursCost)}
                    </td>
                    <td className="py-3 px-2 text-right text-[var(--text-secondary)]">
                      {formatCurrency(person.expenses)}
                    </td>
                    <td className="py-3 px-2 text-right text-[var(--text-primary)] font-medium">
                      {formatCurrency(person.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border-default)]">
                  <td colSpan={2} className="py-3 px-2 text-[var(--text-primary)] font-semibold">
                    Totale
                  </td>
                  <td className="py-3 px-2 text-right text-[var(--text-primary)] font-semibold">
                    {formatHours(people.reduce((sum, p) => sum + p.hours, 0))}
                  </td>
                  <td className="py-3 px-2 text-right text-[var(--text-primary)] font-semibold">
                    {formatCurrency(people.reduce((sum, p) => sum + p.hoursCost, 0))}
                  </td>
                  <td className="py-3 px-2 text-right text-[var(--text-primary)] font-semibold">
                    {formatCurrency(people.reduce((sum, p) => sum + p.expenses, 0))}
                  </td>
                  <td className="py-3 px-2 text-right text-[var(--text-primary)] font-bold">
                    {formatCurrency(people.reduce((sum, p) => sum + p.total, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm">Nessun dato per questo periodo.</p>
        )}
      </div>
    </div>
  );
}
