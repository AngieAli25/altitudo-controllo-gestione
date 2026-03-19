'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyChartProps {
  data: { month: string; guidaevai: number; reddoak: number }[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6">
      <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-6">Costi mensili per azienda</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-default)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-default)' }}
            tickLine={false}
            tickFormatter={(v) =>
              new Intl.NumberFormat('it-IT', {
                notation: 'compact',
                style: 'currency',
                currency: 'EUR',
              }).format(v)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
            }}
            formatter={(value) =>
              new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR',
              }).format(Number(value))
            }
          />
          <Legend
            wrapperStyle={{ color: 'var(--text-primary)', fontSize: 13 }}
          />
          <Bar
            dataKey="guidaevai"
            name="Guidaevai"
            fill="rgba(255,160,50,0.85)"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="reddoak"
            name="Reddoak"
            fill="rgba(255,60,60,0.85)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
