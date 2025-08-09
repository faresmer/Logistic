
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDataContext } from '@/context/data-context';
import type { Product } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { useTranslations } from 'next-intl';

type DeleteProductAlertProps = {
  product: Product;
  onSuccess?: () => void;
};

export function DeleteProductAlert({ product, onSuccess }: DeleteProductAlertProps) {
  const t = useTranslations('DeleteProductAlert');
  const tActions = useTranslations('Actions');
  const { deleteProduct } = useDataContext();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteProduct(product.id);
    toast({
      title: t('productDeletedSuccess'),
      description: t('productDeletedDescription', {productName: product.name}),
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
          <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('warning', {productName: <span className="font-semibold">{product.name}</span>})}
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
