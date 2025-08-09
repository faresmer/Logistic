
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useDataContext } from '@/context/data-context';
import { format, parseISO, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                    {data.name}
                </span>
                <span className="font-bold">
                    {`${value.toLocaleString()} ${unit || ''}`}
                </span>
            </div>
          </div>
        </div>
      );
    }
  
    return null;
  };

export function ReportsClient() {
  const t = useTranslations('ReportsPage');
  const { receipts, products, customers } = useDataContext();

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

  const topSellingProducts = React.useMemo(() => {
    const productSales: { [key: string]: { name: string, sales: number } } = {};

    receipts.forEach(receipt => {
      receipt.lineItems.forEach(item => {
        if (productSales[item.productId]) {
          productSales[item.productId].sales += item.quantity;
        } else {
          productSales[item.productId] = {
            name: item.productName,
            sales: item.quantity,
          };
        }
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [receipts]);

  const productStockLevels = React.useMemo(() => {
    return [...products]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10) // Show top 10 most stocked
      .map(p => ({ name: p.name, stock: p.stock }));
  }, [products]);

  const categoryDistribution = React.useMemo(() => {
    const categories: { [key: string]: number } = {};
    products.forEach(product => {
      if (categories[product.category]) {
        categories[product.category]++;
      } else {
        categories[product.category] = 1;
      }
    });
    return Object.keys(categories).map(name => ({ name, value: categories[name] }));
  }, [products]);

  const topCustomers = React.useMemo(() => {
    return [...customers]
      .sort((a, b) => b.purchaseHistory - a.purchaseHistory)
      .slice(0, 10)
      .map(c => ({ name: c.name, value: c.purchaseHistory }));
  }, [customers]);

  const customerTypeDistribution = React.useMemo(() => {
    const types: { [key: string]: number } = { 'Wholesale': 0, 'Retail': 0 };
    customers.forEach(customer => {
      if (types[customer.type] !== undefined) {
        types[customer.type]++;
      }
    });
    return Object.keys(types).map(name => ({ name, value: types[name] }));
  }, [customers]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">{t('tabs.sales')}</TabsTrigger>
          <TabsTrigger value="inventory">{t('tabs.inventory')}</TabsTrigger>
          <TabsTrigger value="customers">{t('tabs.customers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t('monthlySalesTitle')}</CardTitle>
                <CardDescription>
                  {t('monthlySalesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
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
                        formatter={(value: number) => [`${value.toFixed(2)} DA`, "Sales"]}
                    />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t('topSellingTitle')}</CardTitle>
                <CardDescription>
                  {t('topSellingDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Tooltip content={<CustomTooltip unit={t('unitsSold')} />} />
                        <Pie data={topSellingProducts} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8">
                            {topSellingProducts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="inventory">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                  <CardHeader>
                      <CardTitle>{t('currentStockTitle')}</CardTitle>
                      <CardDescription>
                          {t('currentStockDescription')}
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                      <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={productStockLevels} layout="vertical">
                              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} />
                              <Tooltip
                                  cursor={{ fill: 'hsl(var(--muted))' }}
                                  content={<CustomTooltip unit={t('stockUnit')} />}
                              />
                              <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>
              <Card className="col-span-3">
                  <CardHeader>
                      <CardTitle>{t('categoryDistTitle')}</CardTitle>
                      <CardDescription>
                          {t('categoryDistDescription')}
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                              <Tooltip content={<CustomTooltip unit={t('productsUnit')} />} />
                              <Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8">
                                  {categoryDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Legend />
                          </PieChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>
          </div>
        </TabsContent>
        <TabsContent value="customers">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t('topCustomersTitle')}</CardTitle>
                        <CardDescription>
                            {t('topCustomersDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={topCustomers} layout="vertical">
                                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    content={<CustomTooltip unit="DA" />}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t('customerTypeDistTitle')}</CardTitle>
                        <CardDescription>
                            {t('customerTypeDistDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Tooltip content={<CustomTooltip unit={t('customersUnit')} />} />
                                <Pie data={customerTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8">
                                    {customerTypeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
