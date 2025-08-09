
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateStockAlert, type StockAlertOutput } from '@/ai/flows/stock-alert';
import { BrainCircuit, ThumbsUp, AlertTriangle, Lightbulb, PlusCircle, Printer, Trash2, ChevronsUpDown, Check } from 'lucide-react';
import { useDataContext } from '@/context/data-context';
import type { HistoricalSale, StockLevel, Product } from '@/lib/types';
import jsPDF from 'jspdf';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';


const ProductCombobox = ({ products, onSelect }: { products: Product[], onSelect: (productName: string) => void }) => {
    const t = useTranslations('StockAlertsPage');
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || t('selectProductToAdd')}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search product..." />
            <CommandList>
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      onSelect(product.name);
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.name ? "opacity-100" : "opacity-0"
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


function RestockListPanel({ initialItems, products }: { initialItems: string[], products: Product[] }) {
    const t = useTranslations('StockAlertsPage');
    const [restockList, setRestockList] = React.useState<string[]>([]);
    
    React.useEffect(() => {
        setRestockList(initialItems);
    }, [initialItems]);
    
    const handleAddItem = (newItem: string) => {
        if (newItem && !restockList.includes(newItem)) {
            setRestockList([...restockList, newItem]);
        }
    };

    const handleRemoveItem = (itemToRemove: string) => {
        setRestockList(restockList.filter(item => item !== itemToRemove));
    };

    const handlePrintList = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Product Restock List', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        const date = new Date().toLocaleDateString();
        doc.text(`Generated on: ${date}`, 105, 28, { align: 'center' });
        
        const listText = restockList.map((item, index) => `${index + 1}. ${item}`).join('\n');
        doc.text(listText, 20, 45);

        doc.save(`restock-list-${date}.pdf`);
    };

    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>{t('finalRestockListTitle')}</CardTitle>
                <CardDescription>
                    {t('finalRestockListDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <ProductCombobox products={products} onSelect={handleAddItem} />
                </div>
                <div className="rounded-md border p-4 h-48 overflow-y-auto space-y-2">
                    {restockList.length > 0 ? (
                        restockList.map(item => (
                            <div key={item} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                                <span className="font-medium">{item}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveItem(item)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center pt-4">{t('emptyList')}</p>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handlePrintList} disabled={restockList.length === 0}>
                    <Printer className="mr-2 h-4 w-4" /> {t('printList')}
                </Button>
            </CardFooter>
        </Card>
    );
}

export function StockAlertsClient() {
  const t = useTranslations('StockAlertsPage');
  const { toast } = useToast();
  const { products, receipts } = useDataContext();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<StockAlertOutput | null>(null);
  
  const [salesData, setSalesData] = React.useState('[]');
  const [stockData, setStockData] = React.useState('[]');
  const [restockList, setRestockList] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Transform live data into the format expected by the AI
    const historicalSales: { [key: string]: HistoricalSale } = {};
    receipts.forEach(receipt => {
      receipt.lineItems.forEach(item => {
        if (!historicalSales[item.productId]) {
          historicalSales[item.productId] = { product: item.productName, sales: [] };
        }
        // This is a simplified aggregation. A real scenario might group by week/month.
        // For this example, we just push quantities to simulate a time series.
        historicalSales[item.productId].sales.push(item.quantity);
      });
    });
    setSalesData(JSON.stringify(Object.values(historicalSales), null, 2));

    const currentStock: StockLevel[] = products.map(p => ({
      product: p.name,
      stock: p.stock,
    }));
    setStockData(JSON.stringify(currentStock, null, 2));

  }, [products, receipts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const output = await generateStockAlert({
        historicalSalesData: salesData,
        currentStockLevels: stockData,
      });
      setResult(output);
      setRestockList(output.productsToRestock);
      toast({
        title: t('analysisCompleteSuccess'),
        description: t('analysisCompleteDescription'),
      });
    } catch (error) {
      console.error('AI Stock Alert Error:', error);
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('errorDescription'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToRestockList = (product: string) => {
    if (!restockList.includes(product)) {
      setRestockList(prev => [...prev, product]);
      toast({
          title: t('addedToListSuccess'),
          description: t('addedToListDescription', { productName: product })
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{t('inputDataTitle')}</CardTitle>
              <CardDescription>
                {t('inputDataDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="historical-sales">{t('salesDataLabel')}</Label>
                <Textarea 
                    id="historical-sales" 
                    rows={10} 
                    value={salesData} 
                    onChange={(e) => setSalesData(e.target.value)}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="current-stock">{t('stockDataLabel')}</Label>
                <Textarea 
                    id="current-stock" 
                    rows={6}
                    value={stockData}
                    onChange={(e) => setStockData(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? t('analyzingButton') : <><BrainCircuit className="mr-2 h-4 w-4" /> {t('analyzeButton')}</>}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('aiAnalysisTitle')}</CardTitle>
            <CardDescription>
              {t('aiAnalysisDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-80">
                <BrainCircuit className="h-12 w-12 animate-pulse text-primary" />
                <p className="mt-4 text-muted-foreground">{t('analyzingText')}</p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                {result.productsToRestock.length > 0 ? (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-destructive" /> {t('productsToRestock')}</h3>
                    <ul className="space-y-2">
                      {result.productsToRestock.map((product) => (
                        <li key={product} className="flex items-center justify-between rounded-md border p-3 bg-secondary/50 font-medium">
                          <span>{product}</span>
                          <Button size="sm" variant="outline" onClick={() => handleAddToRestockList(product)}>
                            <PlusCircle className="h-4 w-4 mr-2" /> {t('addToList')}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                    <ThumbsUp className="h-10 w-10 text-green-500 mb-2" />
                    <h3 className="font-semibold">{t('allGoodTitle')}</h3>
                    <p className="text-muted-foreground text-sm">{t('allGoodDescription')}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center"><Lightbulb className="h-5 w-5 mr-2 text-yellow-500" /> {t('aiReasoning')}</h3>
                  <p className="text-sm text-muted-foreground bg-background p-4 rounded-md border">
                    {result.reasoning}
                  </p>
                </div>
              </div>
            )}
            {!loading && !result && (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center min-h-80">
                <BrainCircuit className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-semibold">{t('awaitingAnalysisTitle')}</h3>
                <p className="text-muted-foreground text-sm">{t('awaitingAnalysisDescription')}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <RestockListPanel initialItems={restockList} products={products} />
      </div>
    </div>
  );
}
