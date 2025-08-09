
'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useDataContext } from '@/context/data-context';
import { format, parseISO, startOfDay } from 'date-fns';
import type { Sale } from '@/lib/types';
import { useTranslations } from 'next-intl';

export function SalesChart() {
  const t = useTranslations('SalesChart');
  const { receipts } = useDataContext();

  const aggregatedSales = React.useMemo(() => {
    const salesByDay: { [key: string]: number } = {};

    receipts.forEach(receipt => {
      const day = format(startOfDay(parseISO(receipt.date)), 'yyyy-MM-dd');
      if (salesByDay[day]) {
        salesByDay[day] += receipt.total;
      } else {
        salesByDay[day] = receipt.total;
      }
    });

    return Object.keys(salesByDay).map(day => ({
      id: day,
      date: new Date(day),
      amount: salesByDay[day],
    })).sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [receipts]);


  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={aggregatedSales}>
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value / 1000}k DA`}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)'
          }}
          formatter={(value: number) => [`${value.toFixed(2)} DA`, t('sales')]}
        />
        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
