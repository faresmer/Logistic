
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
import type { Product } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { useTranslations } from 'next-intl';

type ProductDetailsSheetProps = {
  product: Product;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function ProductDetailsSheet({ product }: ProductDetailsSheetProps) {
  const t = useTranslations('ProductDetailsSheet');
  const tActions = useTranslations('Actions');
  const tAdd = useTranslations('AddProductDialog');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          {tActions('viewDetails')}
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('title', { productName: product.name })}</SheetTitle>
          <SheetDescription>
            {t('description', { productId: product.id })}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="space-y-3">
          <DetailRow label={t('category')} value={product.category} />
          <DetailRow label={tAdd('purchasePriceLabel')} value={`${(product.pricePurchase || 0).toFixed(2)} DA`} />
          <DetailRow label={t('retailPrice')} value={`${(product.priceRetail || 0).toFixed(2)} DA`} />
          <DetailRow label={t('wholesalePrice')} value={`${(product.priceWholesale || 0).toFixed(2)} DA`} />
          <DetailRow label={t('stock')} value={`${product.stock} units`} />
          <Separator className="my-2" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('salesHistory')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('salesHistorySoon')}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('stockHistory')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('stockHistorySoon')}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
