import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar profile={profile} />
      <main className="ml-64 flex-1 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}
