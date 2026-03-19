'use client';

export default function OreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <p className="text-sm text-red-400">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full bg-[var(--btn-primary-bg)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
      >
        Riprova
      </button>
    </div>
  );
}
