'use client';

export default function UtentiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-[var(--text-secondary)] text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="border border-[var(--btn-secondary-border)] bg-transparent text-[var(--text-primary)] rounded-full px-6 py-2 text-sm uppercase tracking-wider hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
      >
        Riprova
      </button>
    </div>
  );
}
