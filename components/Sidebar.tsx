'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/actions';
import CompanyBadge from './CompanyBadge';
import { useTheme } from './ThemeProvider';

interface SidebarProps {
  profile: {
    full_name: string;
    role: string;
    company?: {
      name: string;
    };
  };
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ore', label: 'Ore lavorate' },
  { href: '/spese', label: 'Spese' },
  { href: '/incassi', label: 'Incassi' },
  { href: '/report', label: 'Report', adminOnly: true },
  { href: '/admin/utenti', label: 'Gestione utenti', adminOnly: true },
];

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile.role === 'admin';
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--sidebar-bg)] border-r border-[var(--border-subtle)] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-8">
        <Image
          src="/images/logo_altitudo_esteso.png"
          alt="Altitudo"
          width={160}
          height={32}
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navLinks
            .filter((link) => !link.adminOnly || isAdmin)
            .map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative flex items-center px-4 py-3 rounded-xl text-sm transition-colors ${
                      isActive
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--text-primary)] rounded-full" />
                    )}
                    {link.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* User info + Theme toggle + Logout */}
      <div className="px-6 py-6 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">{profile.full_name}</p>
            {profile.company && (
              <div className="mt-1">
                <CompanyBadge company={profile.company.name} />
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 text-left text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer mb-3"
          aria-label="Cambia tema"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          {theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
        </button>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
