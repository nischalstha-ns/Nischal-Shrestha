import { useState, useEffect, useCallback } from 'react';
import * as db from '../db/index';
import type { Product, Category, Order, Settings } from '@shared/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await db.getAll<Product>('products');
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addProduct = async (product: Omit<Product, 'createdAt' | 'updatedAt'>) => {
    await db.add('products', product);
    await refresh();
  };

  const updateProduct = async (product: Partial<Product> & { id: string }) => {
    await db.update('products', product);
    await refresh();
  };

  const deleteProduct = async (id: string) => {
    await db.remove('products', id);
    await refresh();
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, refresh };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await db.getAll<Category>('categories');
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addCategory = async (category: Omit<Category, 'createdAt' | 'updatedAt'>) => {
    await db.add('categories', category);
    await refresh();
  };

  const updateCategory = async (category: Partial<Category> & { id: string }) => {
    await db.update('categories', category);
    await refresh();
  };

  const deleteCategory = async (id: string) => {
    await db.remove('categories', id);
    await refresh();
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory, refresh };
}

export function useSales() {
  const [sales, setSales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await db.getAll<Order>('sales');
    setSales(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const completeSale = async (order: Order) => {
    await db.processSale(order);
    await refresh();
  };

  return { sales, loading, completeSale, refresh };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await db.getSettings();
    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    await db.saveSettings(newSettings);
    setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    
    // Apply UI changes instantly
    if (newSettings.primaryColor) {
      document.documentElement.style.setProperty('--primary', newSettings.primaryColor);
    }
    if (newSettings.theme) {
      const isDark = newSettings.theme === 'dark' || 
        (newSettings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    }
    if (newSettings.fontSize) {
      const sizes = { small: '14px', medium: '16px', large: '18px' };
      document.documentElement.style.fontSize = sizes[newSettings.fontSize];
    }
  };

  return { 
    settings: settings || {
      id: 'default',
      appName: 'ShopManager POS',
      tagline: 'Local-First Advanced POS',
      companyName: 'My Shop',
      footerText: 'Powered by ShopManager',
      currency: 'NPR',
      currencySymbol: 'NPR',
      locale: 'en-US',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      language: 'en',
      theme: 'light',
      primaryColor: '#4f46e5',
      fontSize: 'medium',
      itemsPerPage: 10,
      showStockBadge: true,
      showLowStockWarning: true,
      enableAnimations: true,
      lowStockThreshold: 5,
      allowNegativeStock: false,
      defaultDiscountType: 'flat',
      maxDiscountPercentage: 100,
      taxEnabled: true,
      taxRate: 13,
      autoClearCart: true,
      showReceiptPreview: true,
      enableSound: false,
      enableKeyboardShortcuts: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Settings, 
    loading, 
    updateSettings, 
    refresh 
  };
}

export function useReports() {
  const [sales, setSales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      const data = await db.getAll<Order>('sales');
      setSales(data);
      setLoading(false);
    };
    loadSales();
  }, []);

  const getStats = useCallback((period: 'day' | 'week' | 'month' | 'all') => {
    const now = new Date();
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      if (period === 'day') return saleDate.toDateString() === now.toDateString();
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return saleDate >= weekAgo;
      }
      if (period === 'month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
    const totalOrders = filtered.length;
    
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filtered.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.quantity * item.price;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { totalRevenue, totalOrders, topProducts };
  }, [sales]);

  return { loading, getStats };
}

import { toast } from 'sonner';
import { exportToExcel, importFromExcel } from '../lib/excel';

export function useAdmin() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [products, categories, sales, logs, storage] = await Promise.all([
        db.getAll<Product>('products'),
        db.getAll<Category>('categories'),
        db.getAll<Order>('sales'),
        db.getAll<any>('stockLogs'),
        db.getStorageInfo(),
      ]);

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
      });
      setStockLogs(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setStorageInfo(storage);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load system data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleReset = async () => {
    try {
      await db.resetAllData();
      toast.success('System reset successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to reset system');
    }
  };

  const handleExport = async () => {
    try {
      const backup = await db.exportBackup();
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shop-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exported successfully');
    } catch (error) {
      toast.error('Failed to export backup');
    }
  };

  const handleExcelExport = async () => {
    try {
      const [products, categories, sales] = await Promise.all([
        db.getAll<Product>('products'),
        db.getAll<Category>('categories'),
        db.getAll<Order>('sales'),
      ]);
      await exportToExcel({ products, categories, sales });
      toast.success('Excel report generated');
    } catch (error) {
      toast.error('Failed to generate Excel report');
    }
  };

  const handleExcelImport = async (file: File) => {
    try {
      const { categories, products } = await importFromExcel(file);
      
      // 1. Import Categories
      for (const cat of categories) {
        if (cat.name) {
          try {
            await db.add('categories', cat as Category);
          } catch (e) {
            // If already exists, update
            await db.update('categories', cat as Category);
          }
        }
      }

      // 2. Import Products
      const allCategories = await db.getAll<Category>('categories');
      for (const prod of products) {
        if (prod.name) {
          // Map category name to ID if needed
          let categoryId = prod.categoryId;
          const foundCat = allCategories.find(c => c.name.toLowerCase() === categoryId?.toLowerCase() || c.id === categoryId);
          if (foundCat) {
            categoryId = foundCat.id;
          } else if (allCategories.length > 0) {
            categoryId = allCategories[0].id; // Fallback
          }

          const productData = {
            ...prod,
            categoryId: categoryId || '',
          } as Product;

          try {
            await db.add('products', productData);
          } catch (e) {
            // If already exists, update
            await db.update('products', productData);
          }
        }
      }

      toast.success('Excel data imported successfully');
      await loadAdminData();
    } catch (error) {
      console.error('Excel import error:', error);
      toast.error('Failed to import Excel data');
    }
  };

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await db.importBackup(content);
        toast.success('Backup imported successfully');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast.error('Failed to import backup. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return { 
    stats, 
    stockLogs, 
    storageInfo, 
    loading, 
    handleReset, 
    handleExport, 
    handleExcelExport, 
    handleExcelImport,
    handleImport, 
    refresh: loadAdminData 
  };
}
