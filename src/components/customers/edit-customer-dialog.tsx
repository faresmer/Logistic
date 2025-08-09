
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDataContext } from '@/context/data-context';
import type { Customer } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Customer name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(6, { message: 'Please enter a valid phone number.' }),
  type: z.enum(['Wholesale', 'Retail']),
});

type EditCustomerDialogProps = {
  customer: Customer;
  onSuccess?: () => void;
};

export function EditCustomerDialog({ customer, onSuccess }: EditCustomerDialogProps) {
  const t = useTranslations('EditCustomerDialog');
  const tAdd = useTranslations('AddCustomerDialog');
  const tActions = useTranslations('Actions');
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { editCustomer } = useDataContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      type: customer.type,
    },
  });

  React.useEffect(() => {
    if(open) {
      form.reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        type: customer.type,
      });
    }
  }, [open, customer, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    editCustomer({ ...customer, ...values });
    toast({
      title: t('customerUpdatedSuccess'),
      description: t('customerUpdatedDescription', { customerName: values.name }),
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
            {t('description', { customerName: customer.name })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tAdd('customerNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={tAdd('customerNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tAdd('emailLabel')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={tAdd('emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tAdd('phoneLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={tAdd('phonePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>{tAdd('customerTypeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={tAdd('selectTypePlaceholder')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Retail">{tAdd('retail')}</SelectItem>
                            <SelectItem value="Wholesale">{tAdd('wholesale')}</SelectItem>
                        </SelectContent>
                    </Select>
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
