
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
import type { Product } from '@/lib/types';
import { useDataContext } from '@/context/data-context';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a non-negative number.' }),
  pricePurchase: z.coerce.number().min(0, { message: 'Purchase price must be a non-negative number.' }),
  priceRetail: z.coerce.number().min(0, { message: 'Retail price must be a non-negative number.' }),
  priceWholesale: z.coerce.number().min(0, { message: 'Wholesale price must be a non-negative number.' }),
});

type EditProductDialogProps = {
  product: Product;
  onSuccess?: () => void;
};

export function EditProductDialog({ product, onSuccess }: EditProductDialogProps) {
  const t = useTranslations('EditProductDialog');
  const tAdd = useTranslations('AddProductDialog');
  const tActions = useTranslations('Actions');
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { editProduct } = useDataContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      category: product.category,
      stock: product.stock,
      pricePurchase: product.pricePurchase || 0,
      priceRetail: product.priceRetail || 0,
      priceWholesale: product.priceWholesale || 0,
    },
  });
  
  React.useEffect(() => {
    if(open) {
      form.reset({
        name: product.name,
        category: product.category,
        stock: product.stock,
        pricePurchase: product.pricePurchase || 0,
        priceRetail: product.priceRetail || 0,
        priceWholesale: product.priceWholesale || 0,
      });
    }
  }, [open, product, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    editProduct({ ...product, ...values });
    toast({
      title: t('productUpdatedSuccess'),
      description: t('productUpdatedDescription', { productName: values.name }),
    });
    onSuccess?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          {tActions('edit')}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description', { productName: product.name })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tAdd('productNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Industrial Widget" {...field} />
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
                  <FormLabel>{tAdd('categoryLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Widgets" {...field} />
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
                    <FormLabel>{tAdd('stockLabel')}</FormLabel>
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
                    <FormLabel>{tAdd('retailPriceLabel')}</FormLabel>
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
                    <FormLabel>{tAdd('wholesalePriceLabel')}</FormLabel>
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
                    <FormLabel>{tAdd('purchasePriceLabel')}</FormLabel>
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
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">{t('saveChanges')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
