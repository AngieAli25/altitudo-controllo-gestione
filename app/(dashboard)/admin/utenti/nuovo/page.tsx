import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CreateUserForm from './CreateUserForm';

export default async function NuovoUtentePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/utenti"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm"
        >
          &larr; Utenti
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Crea nuovo utente</h1>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6">
        <CreateUserForm companies={companies ?? []} />
      </div>
    </div>
  );
}
