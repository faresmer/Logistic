
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDataContext } from '@/context/data-context';
import type { Customer } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { useTranslations } from 'next-intl';

type DeleteCustomerAlertProps = {
  customer: Customer;
  onSuccess?: () => void;
};

export function DeleteCustomerAlert({ customer, onSuccess }: DeleteCustomerAlertProps) {
  const t = useTranslations('DeleteCustomerAlert');
  const tActions = useTranslations('Actions');
  const { deleteCustomer } = useDataContext();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteCustomer(customer.id);
    toast({
      title: t('customerDeletedSuccess'),
      description: t('customerDeletedDescription', { customerName: customer.name }),
    });
    onSuccess?.();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
          {tActions('delete')}
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {t('warning', { customerName: <span className="font-semibold">{customer.name}</span> })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('deleteButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
