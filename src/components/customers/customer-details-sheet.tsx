
'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import type { Customer } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useDataContext } from '@/context/data-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';

type CustomerDetailsSheetProps = {
  customer: Customer;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-right">{value}</p>
    </div>
  );
}

export function CustomerDetailsSheet({ customer }: CustomerDetailsSheetProps) {
    const t = useTranslations('CustomerDetailsSheet');
    const tActions = useTranslations('Actions');
    const { receipts } = useDataContext();
    const customerReceipts = receipts.filter(r => r.customerId === customer.id);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          {tActions('viewDetails')}
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('title', { customerName: customer.name })}</SheetTitle>
          <SheetDescription>
            {t('description', { customerId: customer.id })}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="space-y-3">
          <DetailRow label="Email" value={customer.email} />
          <DetailRow label="Phone" value={customer.phone} />
          <DetailRow label={t('customerType')} value={<Badge variant={customer.type === 'Wholesale' ? 'secondary' : 'outline'}>{customer.type}</Badge>} />
          <Separator className="my-2" />
           <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('purchaseHistory')}</h4>
             <DetailRow label={t('totalSpent')} value={`${customer.purchaseHistory.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`} />
            <ScrollArea className="h-72 w-full pr-4 mt-2">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('receiptId')}</TableHead>
                                <TableHead>{t('date')}</TableHead>
                                <TableHead className="text-right">{t('total')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customerReceipts.length > 0 ? (
                                customerReceipts.map(receipt => (
                                    <TableRow key={receipt.id}>
                                        <TableCell className="font-medium">{receipt.id}</TableCell>
                                        <TableCell>{format(parseISO(receipt.date), 'PPP')}</TableCell>
                                        <TableCell className="text-right">{receipt.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        {t('noPurchaseHistory')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
