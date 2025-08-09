
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/page-header';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '../ui/badge';
import { AddProductDialog } from './add-product-dialog';
import { useDataContext } from '@/context/data-context';
import { EditProductDialog } from './edit-product-dialog';
import { DeleteProductAlert } from './delete-product-alert';
import { ProductDetailsSheet } from './product-details-sheet';
import { useTranslations } from 'next-intl';

export function InventoryClient() {
  const t = useTranslations('InventoryPage');
  const tAdd = useTranslations('AddProductDialog');
  const tActions = useTranslations('Actions');
  const { products, addProduct } = useDataContext();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);


  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStockVariant = (stock: number) => {
    if (stock < 50) return 'destructive';
    if (stock < 100) return 'secondary';
    return 'default';
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
      >
        <AddProductDialog onAddProduct={addProduct} />
      </PageHeader>
      
      <div className="flex items-center">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('productName')}</TableHead>
              <TableHead>{t('category')}</TableHead>
              <TableHead className="text-center">{t('stock')}</TableHead>
              <TableHead className="text-right">{tAdd('purchasePriceLabel')}</TableHead>
              <TableHead className="text-right">{t('retailPrice')}</TableHead>
              <TableHead className="text-right">{t('wholesalePrice')}</TableHead>
              <TableHead>
                <span className="sr-only">{t('actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-center">
                   <Badge variant={getStockVariant(product.stock)}>{product.stock}</Badge>
                </TableCell>
                <TableCell className="text-right">{(product.pricePurchase || 0).toFixed(2)} DA</TableCell>
                <TableCell className="text-right">{(product.priceRetail || 0).toFixed(2)} DA</TableCell>
                <TableCell className="text-right">{(product.priceWholesale || 0).toFixed(2)} DA</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('openMenu', { productName: product.name })}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                        <EditProductDialog product={product} />
                        <ProductDetailsSheet product={product} />
                        {userRole === 'supervisor' && (
                          <>
                            <DropdownMenuSeparator />
                            <DeleteProductAlert product={product} />
                          </>
                        )}
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
