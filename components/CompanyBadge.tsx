interface CompanyBadgeProps {
  company: string;
}

const companyStyles: Record<string, string> = {
  Guidaevai: 'bg-[rgba(255,160,50,0.15)] border-[rgba(255,160,50,0.35)] text-[rgba(255,180,80,0.90)]',
  Reddoak: 'bg-[rgba(255,60,60,0.15)] border-[rgba(255,60,60,0.35)] text-[rgba(255,100,100,0.90)]',
};

export default function CompanyBadge({ company }: CompanyBadgeProps) {
  const bg = companyStyles[company] ?? 'bg-[var(--bg-surface)]';

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs border border-[var(--border-input)] text-[var(--text-secondary)] ${bg}`}
    >
      {company}
    </span>
  );
}
