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
  const chiDeve = saldo > 0 ? 'Guidaevai' : 'Reddoak';
  const aChiDeve = saldo > 0 ? 'Reddoak' : 'Guidaevai';
  const importo = Math.abs(saldo);
  const inPari = Math.abs(saldo) < 0.01;

  return (
    <div className="space-y-6">
      {/* Card hero: CHI DEVE A CHI */}
      <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-default)] rounded-2xl p-8 text-center">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Chi deve a chi
        </p>
        {inPari ? (
          <p className="text-2xl font-bold text-green-400">
            Le aziende sono in pari
          </p>
        ) : (
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {chiDeve} deve{' '}
            <span className={saldo > 0 ? 'text-[rgba(255,180,80,0.90)]' : 'text-[rgba(255,100,100,0.90)]'}>
              {formatCurrency(importo)}
            </span>
            {' '}a {aChiDeve}
          </p>
        )}
      </div>

      {/* Dettaglio numeri */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Risultato progetto
            </p>
            <p className={`text-xl font-semibold ${risultatoProgetto >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(risultatoProgetto)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Per azienda
            </p>
            <p className={`text-xl font-semibold ${risultatoPerAzienda >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(risultatoPerAzienda)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
