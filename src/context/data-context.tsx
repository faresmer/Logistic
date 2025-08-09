

'use client';

import * as React from 'react';
import type { Product, Customer, User, Receipt, StoreInfo, ActivityLog } from '@/lib/types';
import { products as initialProducts, customers as initialCustomers, initialUsers, initialStoreInfo, activityLogs as initialActivityLogs } from '@/lib/data';

interface DataContextType {
  products: Product[];
  customers: Customer[];
  users: User[];
  receipts: Receipt[];
  storeInfo: StoreInfo;
  activityLogs: ActivityLog[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'purchaseHistory'>) => void;
  editCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  addUser: (user: Omit<User, 'id' | 'role' | 'avatar'>) => void;
  deleteUser: (userId: string) => void;
  changeUserPassword: (userId: string, oldPassword: string, newPassword: string) => boolean;
  updateUserAvatar: (userId: string, avatar: string) => void;
  updateProductStock: (productId: string, quantitySold: number) => void;
  updateCustomerPurchaseHistory: (customerId: string, amount: number) => void;
  addReceipt: (receipt: Receipt) => void;
  updateStoreInfo: (info: StoreInfo) => void;
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};


export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', initialCustomers);
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
  const [receipts, setReceipts] = useLocalStorage<Receipt[]>('receipts', []);
  const [storeInfo, setStoreInfo] = useLocalStorage<StoreInfo>('storeInfo', initialStoreInfo);
  const [activityLogs, setActivityLogs] = useLocalStorage<ActivityLog[]>('activityLogs', initialActivityLogs);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const productsInStorage = localStorage.getItem('products');
    if (!productsInStorage) {
        localStorage.setItem('products', JSON.stringify(initialProducts));
    }

    const customersInStorage = localStorage.getItem('customers');
    if (!customersInStorage) {
        localStorage.setItem('customers', JSON.stringify(initialCustomers));
    }
    
    const usersInStorage = localStorage.getItem('users');
    if (!usersInStorage) {
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    
    const receiptsInStorage = localStorage.getItem('receipts');
    if (!receiptsInStorage) {
        localStorage.setItem('receipts', JSON.stringify([]));
    }

    const storeInfoInStorage = localStorage.getItem('storeInfo');
    if (!storeInfoInStorage) {
        localStorage.setItem('storeInfo', JSON.stringify(initialStoreInfo));
    }
    
    const activityLogsInStorage = localStorage.getItem('activityLogs');
    if (!activityLogsInStorage) {
        localStorage.setItem('activityLogs', JSON.stringify(initialActivityLogs));
    }

    setIsInitialized(true);
  }, []);

  const addActivityLog = (action: string) => {
    const username = localStorage.getItem('username') || 'System';
    const currentUser = users.find(u => u.username === username);
    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      user: username,
      avatar: currentUser?.avatar || `https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA`,
      action,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts((prev) => {
      const newProduct: Product = {
        ...product,
        id: `PROD${Date.now()}`,
      };
      addActivityLog(`Added new product: ${newProduct.name}`);
      return [newProduct, ...prev];
    });
  };

  const editProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    addActivityLog(`Updated product: ${updatedProduct.name}`);
  };

  const deleteProduct = (productId: string) => {
    let productName = 'Unknown Product';
    const product = products.find(p => p.id === productId);
    if (product) productName = product.name;
    
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    addActivityLog(`Deleted product: ${productName}`);
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'purchaseHistory'>) => {
    setCustomers((prev) => {
      const newCustomer: Customer = {
        ...customer,
        id: `CUST${Date.now()}`,
        purchaseHistory: 0,
      };
      addActivityLog(`Added new customer: ${newCustomer.name}`);
      return [newCustomer, ...prev];
    });
  };
  
  const editCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
    addActivityLog(`Updated customer: ${updatedCustomer.name}`);
  }

  const deleteCustomer = (customerId: string) => {
    let customerName = 'Unknown Customer';
    const customer = customers.find(c => c.id === customerId);
    if (customer) customerName = customer.name;

    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    addActivityLog(`Deleted customer: ${customerName}`);
  }
  
  const addUser = (user: Omit<User, 'id'|'role' | 'avatar'>) => {
    setUsers((prev) => {
      const newUser: User = {
        ...user,
        id: `USER${Date.now()}`,
        role: 'employee',
        avatar: 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA'
      };
      addActivityLog(`Added new employee: ${newUser.username}`);
      return [...prev, newUser];
    });
  };

  const deleteUser = (userId: string) => {
    let username = 'Unknown User';
    const user = users.find(u => u.id === userId);
    if (user) username = user.username;
    
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addActivityLog(`Deleted employee: ${username}`);
  };
  
  const changeUserPassword = (userId: string, oldPassword: string, newPassword: string): boolean => {
    let success = false;
    let username = '';
    setUsers((prev) => {
      const userIndex = prev.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        success = false;
        return prev;
      }
  
      const user = prev[userIndex];
      if (user.password !== oldPassword) {
        success = false;
        return prev;
      }
      
      const updatedUsers = [...prev];
      updatedUsers[userIndex] = { ...user, password: newPassword };
      username = user.username;
      success = true;
      return updatedUsers;
    });

    if (success) {
      addActivityLog(`Changed password for ${username}.`);
    }

    return success;
  };

  const updateUserAvatar = (userId: string, avatar: string) => {
    let username = '';
    setUsers((prev) => {
        const userIndex = prev.findIndex((u) => u.id === userId);
        if (userIndex === -1) return prev;

        const updatedUsers = [...prev];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], avatar };
        username = updatedUsers[userIndex].username;
        return updatedUsers;
    });
     addActivityLog(`Updated avatar for ${username}.`);
  };

  const updateProductStock = (productId: string, quantitySold: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: p.stock - quantitySold } : p
      )
    );
  };

  const updateCustomerPurchaseHistory = (customerId: string, amount: number) => {
    setCustomers((prev) => 
        prev.map((c) => 
            c.id === customerId ? { ...c, purchaseHistory: c.purchaseHistory + amount } : c
        )
    );
  };
  
  const addReceipt = (receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
    addActivityLog(`Generated receipt #${receipt.id} for ${receipt.customerName}.`);
  };

  const updateStoreInfo = (info: StoreInfo) => {
    setStoreInfo(info);
    addActivityLog('Updated store information.');
  }
  
  if (!isInitialized) {
      return null;
  }

  return (
    <DataContext.Provider value={{ products, customers, users, receipts, storeInfo, activityLogs, addProduct, editProduct, deleteProduct, addCustomer, editCustomer, deleteCustomer, addUser, deleteUser, changeUserPassword, updateUserAvatar, updateProductStock, updateCustomerPurchaseHistory, addReceipt, updateStoreInfo }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
