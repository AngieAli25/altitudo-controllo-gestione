'use client';

interface ExportCSVProps {
  data: {
    name: string;
    company: string;
    hours: number;
    hoursCost: number;
    expenses: number;
    revenue: number;
    total: number;
  }[];
  month: string;
}

export default function ExportCSV({ data, month }: ExportCSVProps) {
  function handleExport() {
    const header = 'Nome,Azienda,Ore,Costo Ore,Spese,Incassi,Totale Costi';
    const rows = data.map((row) =>
      [
        `"${row.name}"`,
        `"${row.company}"`,
        row.hours.toFixed(1),
        row.hoursCost.toFixed(2),
        row.expenses.toFixed(2),
        row.revenue.toFixed(2),
        row.total.toFixed(2),
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${month}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="border border-[var(--btn-secondary-border)] bg-transparent text-[var(--text-primary)] rounded-full px-6 py-3 uppercase tracking-wider text-sm hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
    >
      Esporta CSV
    </button>
  );
}
