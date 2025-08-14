
import type { Product, Customer, ActivityLog, Sale, HistoricalSale, StockLevel, User, StoreInfo } from './types';

export const products: Product[] = [
  { id: 'PROD001', name: 'Industrial Widget', category: 'Widgets', stock: 150, priceRetail: 25.99, priceWholesale: 20.99, pricePurchase: 15.00 },
  { id: 'PROD002', name: 'Heavy-Duty Gear', category: 'Gears', stock: 75, priceRetail: 120.50, priceWholesale: 95.50, pricePurchase: 70.00 },
  { id: 'PROD003', name: 'Micro-Controller Unit', category: 'Electronics', stock: 300, priceRetail: 45.00, priceWholesale: 38.00, pricePurchase: 25.00 },
  { id: 'PROD004', name: 'Hydraulic Piston', category: 'Hydraulics', stock: 40, priceRetail: 350.75, priceWholesale: 280.75, pricePurchase: 200.00 },
  { id: 'PROD005', name: 'Conveyor Belt Roll', category: 'Conveyors', stock: 20, priceRetail: 899.99, priceWholesale: 750.00, pricePurchase: 600.00 },
  { id: 'PROD006', name: 'Safety Goggles (12-pack)', category: 'Safety', stock: 250, priceRetail: 30.00, priceWholesale: 24.00, pricePurchase: 18.00 },
  { id: 'PROD007', name: 'Precision Bearing', category: 'Gears', stock: 500, priceRetail: 15.25, priceWholesale: 12.00, pricePurchase: 8.50 },
  { id: 'PROD008', name: 'Power Supply Unit', category: 'Electronics', stock: 120, priceRetail: 75.00, priceWholesale: 60.00, pricePurchase: 45.00 },
];

export const customers: Customer[] = [
  { id: 'CUST001', name: 'Global Manufacturing Inc.', type: 'Wholesale', email: 'purchasing@globalmfg.com', phone: '555-0101', purchaseHistory: 150234.50 },
  { id: 'CUST002', name: 'Local Hardware', type: 'Retail', email: 'contact@localhardware.com', phone: '555-0102', purchaseHistory: 7845.20 },
  { id: 'CUST003', name: 'Construct-A-Lot Corp.', type: 'Wholesale', email: 'supplies@constructalot.com', phone: '555-0103', purchaseHistory: 345890.00 },
  { id: 'CUST004', name: 'DIY Central', type: 'Retail', email: 'help@diycentral.com', phone: '555-0104', purchaseHistory: 1234.99 },
  { id: 'CUST005', name: 'Tech Solutions Ltd.', type: 'Wholesale', email: 'orders@techsolutions.net', phone: '555-0105', purchaseHistory: 89056.75 },
];

export const activityLogs: ActivityLog[] = [
  { id: 'LOG001', user: 'employee', avatar: 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA', action: 'Updated stock for PROD003 to 280 units.', timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString() },
  { id: 'LOG002', user: 'supervisor', avatar: 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA', action: 'Added new customer: Tech Solutions Ltd.', timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: 'LOG003', user: 'employee', avatar: 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA', action: 'Processed sale #SALE0987 for DIY Central.', timestamp: new Date(Date.now() - 3600000 * 2.2).toISOString() },
  { id: 'LOG004', user: 'supervisor', avatar: 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA', action: 'Generated monthly sales report.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'LOG005', user: 'employee', avatar: 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA', action: 'Deleted product PROD009 (obsolete).', timestamp: new Date(Date.now() - 3600000 * 5.5).toISOString() },
];

export const salesData: Sale[] = Array.from({ length: 30 }, (_, i) => ({
  id: `SALE${i}`,
  date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
  amount: Math.floor(Math.random() * (5000 - 500 + 1)) + 500,
}));

export const topSellingProducts = [
  { name: 'Micro-Controller Unit', sales: 450 },
  { name: 'Industrial Widget', sales: 380 },
  { name: 'Safety Goggles', sales: 310 },
  { name: 'Power Supply Unit', sales: 250 },
  { name: 'Precision Bearing', sales: 180 },
];


export const historicalSalesData: HistoricalSale[] = [
  { "product": "Industrial Widget", "sales": [30, 45, 50, 40, 60, 55] },
  { "product": "Heavy-Duty Gear", "sales": [10, 12, 15, 14, 18, 20] },
  { "product": "Micro-Controller Unit", "sales": [80, 95, 110, 100, 120, 130] },
  { "product": "Hydraulic Piston", "sales": [5, 4, 6, 8, 7, 9] }
];

export const currentStockLevels: StockLevel[] = [
  { "product": "Industrial Widget", "stock": 150 },
  { "product": "Heavy-Duty Gear", "stock": 75 },
  { "product": "Micro-Controller Unit", "stock": 90 },
  { "product": "Hydraulic Piston", "stock": 40 }
];

const defaultAvatar = 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA'

export const initialUsers: User[] = [
    { id: 'USER001', username: 'supervisor', role: 'supervisor', password: 'password', avatar: defaultAvatar },
    { id: 'USER002', username: 'employee', role: 'employee', password: 'password', avatar: defaultAvatar },
];

export const initialStoreInfo: StoreInfo = {
    name: 'AMF Logistic',
    address: '123 Industrial Way, Logistown',
    logo: '',
};
