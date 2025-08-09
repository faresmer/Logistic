

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/page-header';
import { useDataContext } from '@/context/data-context';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ShieldAlert } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { User } from '@/lib/types';
import { useTranslations } from 'next-intl';

export function ActivityHistoryClient() {
  const t = useTranslations('ActivityHistoryPage');
  const { activityLogs, users } = useDataContext();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const filteredLogs = activityLogs.filter(
    (log) => {
        const logDate = parseISO(log.timestamp);
        const isSearchMatch =
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());
        
        const isDateMatch = dateRange?.from ? (
            logDate >= dateRange.from && (dateRange.to ? logDate <= dateRange.to : true)
        ) : true;
        
        return isSearchMatch && isDateMatch;
    }
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (userRole !== 'supervisor') {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex flex-col items-center text-center">
                <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">{t('accessDenied')}</h1>
                <p className="text-muted-foreground">
                    {t('accessDeniedDescription')}
                </p>
            </div>
        </div>
    );
  }

  const getUserAvatar = (username: string) => {
    const user = users.find(u => u.username === username);
    return user?.avatar || 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA';
  }


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
          onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
          }}
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
              <TableHead>{t('user')}</TableHead>
              <TableHead>{t('action')}</TableHead>
              <TableHead>{t('timestamp')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={getUserAvatar(log.user)} alt={log.user} data-ai-hint="anonymous person" />
                        <AvatarFallback>{log.user.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{log.user}</span>
                  </div>
                </TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
        >
            {t('previous')}
        </Button>
        <span className='text-sm text-muted-foreground'>
            {t('page', { currentPage, totalPages })}
        </span>
        <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
        >
            {t('next')}
        </Button>
      </div>
    </div>
  );
}
