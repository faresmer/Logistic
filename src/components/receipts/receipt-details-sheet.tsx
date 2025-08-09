
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
import type { Receipt } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { ScrollText } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ReceiptDetailsSheetProps = {
  receipt: Receipt;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-right">{value}</p>
    </div>
  );
}

export function ReceiptDetailsSheet({ receipt }: ReceiptDetailsSheetProps) {
  const t = useTranslations('ReceiptDetailsSheet');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ScrollText className="mr-2 h-4 w-4" />
          {t('viewDetails')}
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
          <SheetDescription>
            {t('description', { receiptId: receipt.id })}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="space-y-4">
            <DetailRow label={t('customer')} value={receipt.customerName} />
            <DetailRow label={t('date')} value={format(parseISO(receipt.date), 'PPP p')} />
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('itemsPurchased')}</h4>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('product')}</TableHead>
                            <TableHead className="text-center">{t('quantity')}</TableHead>
                            <TableHead className="text-right">{t('price')}</TableHead>
                            <TableHead className="text-right">{t('total')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receipt.lineItems.map((item, index) => (
                            <TableRow key={`${item.productId}-${index}`}>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{(item.quantity * item.price).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
        <Separator className="my-4" />
        <div className='flex justify-end'>
            <DetailRow label={t('grandTotal')} value={<span className='text-lg font-bold'>{receipt.total.toFixed(2)} DA</span>} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
