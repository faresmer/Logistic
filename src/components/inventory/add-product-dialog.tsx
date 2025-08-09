
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a non-negative number.' }),
  pricePurchase: z.coerce.number().min(0, { message: 'Purchase price must be a non-negative number.' }),
  priceRetail: z.coerce.number().min(0, { message: 'Retail price must be a non-negative number.' }),
  priceWholesale: z.coerce.number().min(0, { message: 'Wholesale price must be a non-negative number.' }),
});

type AddProductDialogProps = {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
};

export function AddProductDialog({ onAddProduct }: AddProductDialogProps) {
  const t = useTranslations('AddProductDialog');
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      stock: 0,
      pricePurchase: 0,
      priceRetail: 0,
      priceWholesale: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddProduct(values);
    toast({
      title: t('productAddedSuccess'),
      description: t('productAddedDescription', {productName: values.name}),
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            form.reset();
        }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          {t('addProductButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('productNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('productNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('categoryPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('stockLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceRetail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('retailPriceLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="25.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="priceWholesale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('wholesalePriceLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="20.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="pricePurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('purchasePriceLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="18.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t('cancel')}
                </Button>
              </DialogClose>
              <Button type="submit">{t('addProductButton')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
