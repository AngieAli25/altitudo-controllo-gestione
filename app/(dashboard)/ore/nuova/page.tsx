import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import WorkEntryForm from './WorkEntryForm';

export default async function NuovaOrePage() {
  const profile = await requireAuth();
  const isAdmin = profile.role === 'admin';

  let users: { id: string; full_name: string; company_id: string; hourly_rate: number }[] = [];
  let companies: { id: string; name: string }[] = [];
  if (isAdmin) {
    const supabase = await createClient();
    const [usersRes, companiesRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, company_id, hourly_rate').order('full_name'),
      supabase.from('companies').select('id, name').order('name'),
    ]);
    users = usersRes.data ?? [];
    companies = companiesRes.data ?? [];
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nuova registrazione ore</h1>

      <div className="rounded-2xl bg-[var(--bg-surface)] p-6">
        <div className="mb-4 rounded-xl bg-[var(--bg-surface)] px-4 py-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Tariffa oraria:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
                profile.hourly_rate
              )}
              /h
            </span>
          </p>
        </div>

        <WorkEntryForm
          hourlyRate={profile.hourly_rate}
          isAdmin={isAdmin}
          users={users}
          companies={companies}
          currentUserId={profile.id}
          currentCompanyId={profile.company_id}
        />
      </div>
    </div>
  );
}
