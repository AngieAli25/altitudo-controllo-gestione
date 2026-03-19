import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export function formatDate(date: string) {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: it });
}

export function formatDateTime(date: string) {
  return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: it });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatHours(hours: number) {
  return `${hours.toFixed(1)}h`;
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy', { locale: it }),
    });
  }
  return months;
}
