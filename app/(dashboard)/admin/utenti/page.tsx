import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import UserRow from './UserRow';

export default async function UtentiPage() {
  await requireAdmin();
  const supabase = await createAdminClient();

  // Fetch all profiles with company info
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, company:companies(id, name)')
    .order('full_name');

  // Fetch companies for the edit dropdown
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .order('name');

  // Fetch auth users to get emails
  const { data: authData } = await supabase.auth.admin.listUsers();
  const authUsers = authData?.users ?? [];

  const emailMap = new Map<string, string>();
  for (const u of authUsers) {
    emailMap.set(u.id, u.email ?? '');
  }

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: emailMap.get(p.id) ?? '',
    company_id: p.company?.id ?? '',
    company_name: p.company?.name ?? '—',
    role: p.role,
    hourly_rate: p.hourly_rate,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Gestione utenti</h1>
        <Link
          href="/admin/utenti/nuovo"
          className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-full px-6 py-3 text-sm uppercase tracking-wider font-medium hover:bg-[var(--btn-primary-hover)] transition-colors"
        >
          Crea nuovo utente
        </Link>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-3">
                  Nome
                </th>
                <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-3">
                  Email
                </th>
                <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-3">
                  Azienda
                </th>
                <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-3">
                  Ruolo
                </th>
                <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-3">
                  Tariffa oraria
                </th>
                <th className="text-left text-[var(--text-muted)] uppercase tracking-wider text-xs font-medium py-3 px-3">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow key={user.id} user={user} companies={companies ?? []} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)] text-sm">
                    Nessun utente trovato.
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
