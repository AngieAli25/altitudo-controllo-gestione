export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
