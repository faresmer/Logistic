
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/page-header';
import { MoreHorizontal, Printer } from 'lucide-react';
import { useDataContext } from '@/context/data-context';
import { format, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { generatePdf } from '@/lib/pdf-generator';
import { ReceiptDetailsSheet } from './receipt-details-sheet';
import { useTranslations } from 'next-intl';

export function ReceiptsClient() {
  const t = useTranslations('ReceiptsPage');
  const tDetails = useTranslations('ReceiptDetailsSheet');
  const { receipts, storeInfo } = useDataContext();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const filteredReceipts = receipts.filter(
    (receipt) => {
      const receiptDate = parseISO(receipt.date);
      const isNameMatch = receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const isDateMatch = dateRange?.from ? (
          receiptDate >= dateRange.from && (dateRange.to ? receiptDate <= dateRange.to : true)
      ) : true;
      return isNameMatch && isDateMatch;
    }
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      
      <div className="flex items-center gap-2">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"outline"}>
                    {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                    ) : (
                        <span>{t('pickDateRange')}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
        <Button variant="secondary" onClick={() => { setSearchTerm(''); setDateRange(undefined); }}>{t('clearFilters')}</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('receiptId')}</TableHead>
              <TableHead>{t('customerName')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead className="text-right">{t('totalAmount')}</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium">{receipt.id}</TableCell>
                <TableCell>{receipt.customerName}</TableCell>
                <TableCell>{format(parseISO(receipt.date), 'PPP')}</TableCell>
                <TableCell className="text-right">{receipt.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <ReceiptDetailsSheet receipt={receipt} />
                        <DropdownMenuItem onClick={() => generatePdf(receipt, storeInfo)}>
                           <Printer className='mr-2 h-4 w-4' />
                           {tDetails('print')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
