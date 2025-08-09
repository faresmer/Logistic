

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  priceRetail?: number;
  priceWholesale?: number;
  pricePurchase?: number;
};

export type Customer = {
  id: string;
  name: string;
  type: 'Wholesale' | 'Retail';
  email: string;
  phone: string;
  purchaseHistory: number;
};

export type ActivityLog = {
  id: string;
  user: string;
  avatar: string;
  action: string;
  timestamp: string;
};

export type Sale = {
  id: string;
  date: Date;
  amount: number;
};

export type HistoricalSale = {
  product: string;
  sales: number[];
};

export type StockLevel = {
  product: string;
  stock: number;
};

export type User = {
  id: string;
  username: string;
  role: 'supervisor' | 'employee';
  password?: string; // For simplicity, we'll use a default password
  avatar: string;
};

export interface LineItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type Receipt = {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  lineItems: LineItem[];
  total: number;
};

export type StoreInfo = {
  name: string;
  address: string;
  logo: string;
};
