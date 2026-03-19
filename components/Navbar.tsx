'use client';

import Image from 'next/image';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-[var(--bg)] backdrop-blur-md border-b border-[var(--border-subtle)] lg:hidden">
      <Image
        src="/images/logo_altitudo.png"
        alt="Altitudo"
        width={32}
        height={32}
        className="h-8 w-auto"
      />
      <h1 className="text-[var(--text-primary)] text-lg font-medium">{title}</h1>
    </header>
  );
}
