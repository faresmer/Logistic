
'use client';

import * as React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '../ui/input';
import { useDataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, ChevronsUpDown, Check } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { LineItem, Receipt } from '@/lib/types';
import { generatePdf } from '@/lib/pdf-generator';
import { useTranslations } from 'next-intl';


interface DraftLineItem {
  productId: string;
  quantity: number;
  price: number;
}

const ProductCombobox = ({ value, onChange, customerType }: { value: string, onChange: (value: string) => void, customerType: 'Retail' | 'Wholesale' | '' }) => {
    const t = useTranslations('GenerateReceiptDialog');
    const { products } = useDataContext();
    const [open, setOpen] = React.useState(false)
   
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between col-span-5"
            disabled={!customerType}
          >
            {value
              ? products.find((product) => product.id === value)?.name
              : t('selectProduct')}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={t('searchProduct')} />
            <CommandList>
              <CommandEmpty>{t('noProductFound')}</CommandEmpty>
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => {
                      onChange(product.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {product.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
}

const CustomerCombobox = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const t = useTranslations('GenerateReceiptDialog');
    const { customers } = useDataContext();
    const [open, setOpen] = React.useState(false)
   
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between col-span-3"
          >
            {value
              ? customers.find((customer) => customer.id === value)?.name
              : t('selectCustomer')}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={t('searchCustomer')} />
            <CommandList>
              <CommandEmpty>{t('noCustomerFound')}</CommandEmpty>
              <CommandGroup>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => {
                      onChange(customer.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {customer.name} ({customer.type})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
}

export function GenerateReceiptDialog() {
  const t = useTranslations('GenerateReceiptDialog');
  const tActions = useTranslations('Actions');
  const { customers, products, updateProductStock, updateCustomerPurchaseHistory, addReceipt, storeInfo } = useDataContext();
  const [open, setOpen] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [customerId, setCustomerId] = React.useState('');
  const [lineItems, setLineItems] = React.useState<DraftLineItem[]>([
    { productId: '', quantity: 1, price: 0 },
  ]);
  const { toast } = useToast();

  const selectedCustomer = React.useMemo(() => customers.find(c => c.id === customerId), [customerId, customers]);
  const customerType = selectedCustomer?.type || '';

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !customerType) return;
    
    const price = (customerType === 'Wholesale' ? product.priceWholesale : product.priceRetail) || 0;

    const newLineItems = [...lineItems];
    newLineItems[index].productId = productId;
    newLineItems[index].price = price;
    setLineItems(newLineItems);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const newLineItems = [...lineItems];
    newLineItems[index].quantity = parseInt(quantity, 10) || 0;
    setLineItems(newLineItems);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { productId: '', quantity: 1, price: 0 }]);
  };
  
  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (lineItems[index].productId && lineItems[index].quantity > 0) {
            handleAddLineItem();
        }
    }
  };

  const handleRemoveLineItem = (index: number) => {
    const newLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newLineItems);
  };

  const total = React.useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [lineItems]);

  const handleGenerate = () => {
    if (!customerId || lineItems.some(item => !item.productId || item.quantity <= 0)) {
        toast({
            variant: 'destructive',
            title: t('missingInfoTitle'),
            description: t('missingInfoDescription'),
        });
        return;
    }
    setShowConfirmation(true);
  };
  
  const resetState = () => {
    setCustomerId('');
    setLineItems([{ productId: '', quantity: 1, price: 0 }]);
    setShowConfirmation(false);
    setOpen(false);
  }

  const handleConfirmAndPrint = () => {
    // 1. Update stock levels
    lineItems.forEach(item => {
        updateProductStock(item.productId, item.quantity);
    });

    // 2. Update customer purchase history
    updateCustomerPurchaseHistory(customerId, total);

    // 3. Create receipt object
    const saleDate = new Date();
    const saleId = `SALE${Date.now()}`;
    
    const finalLineItems: LineItem[] = lineItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            productId: item.productId,
            productName: product?.name || 'Unknown',
            quantity: item.quantity,
            price: item.price,
        }
    });

    const newReceipt: Receipt = {
        id: saleId,
        date: saleDate.toISOString(),
        customerId: customerId,
        customerName: selectedCustomer?.name || 'Unknown Customer',
        lineItems: finalLineItems,
        total: total,
    }

    // 4. Add receipt to context
    addReceipt(newReceipt);

    // 5. Generate PDF
    generatePdf(newReceipt, storeInfo);
    
    toast({
      title: t('receiptGeneratedSuccess'),
      description: t('receiptGeneratedDescription', { total: total.toFixed(2), customerName: selectedCustomer?.name }),
    });
    resetState();
  };

  React.useEffect(() => {
    // Reset line items if customer changes, as prices depend on customer type
    setLineItems([{ productId: '', quantity: 1, price: 0 }]);
  }, [customerId]);


  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full text-primary bg-primary-foreground hover:bg-primary-foreground/90">
            {t('generate')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 flex-1 overflow-y-auto pr-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                {t('customerLabel')}
              </Label>
              <CustomerCombobox value={customerId} onChange={setCustomerId} />
            </div>
            <div className='space-y-4'>
                <Label>{t('productsLabel')} {customerType && <span className="text-muted-foreground">{t('pricing', { customerType: customerType })}</span>}</Label>
                <ScrollArea className="h-72 w-full pr-4">
                  <div className='space-y-3'>
                  {lineItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 items-center gap-2">
                          <ProductCombobox value={item.productId} onChange={(value) => handleProductChange(index, value)} customerType={customerType} />
                          <Input 
                              type="number" 
                              placeholder="Qty" 
                              className="col-span-2"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                              onKeyDown={(e) => handleQuantityKeyDown(e, index)}
                              disabled={!item.productId}
                          />
                          <Input 
                              type="text" 
                              readOnly 
                              value={`${(item.price || 0).toFixed(2)} DA`}
                              className="col-span-2 bg-muted"
                          />
                          <Input 
                              type="text" 
                              readOnly 
                              value={`${(item.price * item.quantity).toFixed(2)} DA`}
                              className="col-span-2 bg-muted font-medium"
                          />
                          <Button variant="ghost" size="icon" className="col-span-1" onClick={() => handleRemoveLineItem(index)} disabled={lineItems.length <= 1}>
                              <Trash2 className="h-4 w-4 text-destructive"/>
                          </Button>
                      </div>
                  ))}
                  </div>
                </ScrollArea>
                 <Button variant="outline" size="sm" onClick={handleAddLineItem} disabled={!customerType}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('addProduct')}
                </Button>
            </div>
            <div className="flex justify-end items-center gap-4 mt-4">
                <p className="text-lg font-semibold">{t('total')}</p>
                <p className="text-2xl font-bold">{total.toFixed(2)} DA</p>
            </div>
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <DialogClose asChild>
                <Button variant="outline">{tActions('delete')}</Button>
            </DialogClose>
            <Button onClick={handleGenerate}>{t('generate')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmSaleTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('confirmSaleDescription', { customerName: customers.find(c => c.id === customerId)?.name, total: total.toFixed(2) })}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button variant="outline" onClick={() => setShowConfirmation(false)}>{tActions('delete')}</Button>
                <AlertDialogAction onClick={handleConfirmAndPrint}>{t('confirmAndGenerate')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
