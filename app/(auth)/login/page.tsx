'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { loginAction } from '@/lib/actions';

type LoginState = { error?: string } | null;

async function loginWithState(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  return loginAction(formData);
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginWithState, null);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-12">
          <Image
            src="/images/logo_altitudo_esteso.png"
            alt="Altitudo"
            width={200}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm text-[var(--text-secondary)] mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
              placeholder="nome@azienda.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-[var(--text-secondary)] mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-full uppercase tracking-wider text-sm font-semibold py-3 mt-2 hover:bg-[var(--btn-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
