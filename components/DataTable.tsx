interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  footer?: Record<string, string>;
}

export default function DataTable({ columns, data, footer }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-[var(--text-secondary)] uppercase text-xs tracking-wider px-4 py-3 font-medium"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                  {row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"
              >
                Nessun dato disponibile
              </td>
            </tr>
          )}
        </tbody>
        {footer && (
          <tfoot>
            <tr className="border-t-2 border-[var(--border-input)]">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-[var(--text-primary)] font-bold">
                  {footer[col.key] ?? ''}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
