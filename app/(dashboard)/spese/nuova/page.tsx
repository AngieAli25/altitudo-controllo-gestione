import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import ExpenseEntryForm from './ExpenseEntryForm';

export default async function NuovaSpesaPage() {
  const profile = await requireAuth();
  const isAdmin = profile.role === 'admin';

  let users: { id: string; full_name: string; company_id: string }[] = [];
  let companies: { id: string; name: string }[] = [];
  if (isAdmin) {
    const supabase = await createClient();
    const [usersRes, companiesRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, company_id').order('full_name'),
      supabase.from('companies').select('id, name').order('name'),
    ]);
    users = usersRes.data ?? [];
    companies = companiesRes.data ?? [];
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nuova spesa</h1>

      <div className="rounded-2xl bg-[var(--bg-surface)] p-6">
        <ExpenseEntryForm
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
