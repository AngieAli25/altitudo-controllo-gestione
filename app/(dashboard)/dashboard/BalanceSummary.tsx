import { formatCurrency } from '@/lib/utils';

interface BalanceSummaryProps {
  costoGuidaevai: number;
  costoReddoak: number;
  incassiTotali: number;
  costiTotali: number;
  risultatoProgetto: number;
  risultatoPerAzienda: number;
  saldo: number; // positivo = GV deve a RD, negativo = RD deve a GV
}

export default function BalanceSummary({
  costoGuidaevai,
  costoReddoak,
  incassiTotali,
  costiTotali,
  risultatoProgetto,
  risultatoPerAzienda,
  saldo,
}: BalanceSummaryProps) {
  const chiDeveAChi =
    saldo > 0
      ? `Guidaevai deve ${formatCurrency(saldo)} a Reddoak`
      : saldo < 0
      ? `Reddoak deve ${formatCurrency(Math.abs(saldo))} a Guidaevai`
      : 'Le aziende sono in pari';

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6 space-y-5">
      <h3 className="text-[var(--text-primary)] text-lg font-semibold">
        Progetto Altitudo
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Guidaevai ha speso
          </p>
          <p className="text-xl font-semibold text-[rgba(255,180,80,0.90)]">
            {formatCurrency(costoGuidaevai)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Reddoak ha speso
          </p>
          <p className="text-xl font-semibold text-[rgba(255,100,100,0.90)]">
            {formatCurrency(costoReddoak)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Progetto ha incassato
          </p>
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {formatCurrency(incassiTotali)}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Risultato
          </p>
          <p
            className={`text-xl font-semibold ${
              risultatoProgetto >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(risultatoProgetto)}
            <span className="text-sm font-normal text-[var(--text-muted)] ml-2">
              {risultatoProgetto >= 0 ? '(profitto)' : '(perdita)'}
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Per azienda
          </p>
          <p
            className={`text-xl font-semibold ${
              risultatoPerAzienda >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(risultatoPerAzienda)}
            <span className="text-sm font-normal text-[var(--text-muted)] ml-2">
              ciascuna
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Chi deve a chi
        </p>
        <p className="text-lg font-bold text-[var(--text-primary)]">
          {chiDeveAChi}
        </p>
      </div>
    </div>
  );
}
