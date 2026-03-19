'use client';

interface FormMessageProps {
  message?: string;
  type?: 'error' | 'success';
}

export default function FormMessage({ message, type = 'error' }: FormMessageProps) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
