
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Boxes, DollarSign, Receipt } from 'lucide-react';
import { GenerateReceiptDialog } from './generate-receipt-dialog';
import { useDataContext } from '@/context/data-context';
import { useTranslations } from 'next-intl';

export function OverviewCards() {
  const t = useTranslations('OverviewCards');
  const { products, customers, receipts } = useDataContext();
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const totalSales = receipts.reduce((sum, receipt) => sum + receipt.total, 0);

  const kpiData = [
    { title: t('totalRevenue'), value: `${(totalSales / 1000).toFixed(1)}k DA`, icon: DollarSign, change: t('fromLastMonth', {change: '+20.1%'}) },
    { title: t('totalCustomers'), value: `+${totalCustomers}`, icon: Users, change: t('fromLastMonth', {change: '+180.1%'}) },
    { title: t('totalProducts'), value: `+${totalProducts}`, icon: Boxes, change: t('fromLastMonth', {change: '+19%'}) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card className="lg:col-span-1 bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('newSale')}</CardTitle>
          <Receipt className="h-4 w-4 text-primary-foreground/70" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-primary-foreground/80 mb-4">
            {t('newSaleDescription')}
          </p>
          <GenerateReceiptDialog />
        </CardContent>
      </Card>
      {kpiData.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
