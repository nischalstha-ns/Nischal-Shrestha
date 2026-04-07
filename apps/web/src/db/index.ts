import { openDB, type IDBPDatabase, type StoreNames } from 'idb';
import type { Product, Order, Category, Settings, StockLog } from '@shared/types';

const DB_NAME = 'ShopManagerDB';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('by-name', 'name', { unique: true });
      }
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('stockLogs')) {
        db.createObjectStore('stockLogs', { keyPath: 'id' });
      }
    },
  });
}

// Generic CRUD helpers with auto-timestamps
export async function getAll<T>(storeName: StoreNames<any>): Promise<T[]> {
  const db = await initDB();
  return db.getAll(storeName);
}

export async function getById<T>(storeName: StoreNames<any>, id: string): Promise<T | undefined> {
  const db = await initDB();
  return db.get(storeName, id);
}

export async function add<T extends { id: string; createdAt?: string; updatedAt?: string }>(
  storeName: StoreNames<any>, 
  data: T
): Promise<void> {
  const db = await initDB();
  const now = new Date().toISOString();
  
  // Auto-timestamps
  const item = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  // Unique validation for products
  if (storeName === 'products') {
    const products = await db.getAll('products');
    if (products.some((p: any) => p.name.toLowerCase() === (item as any).name.toLowerCase())) {
      throw new Error(`Product with name "${(item as any).name}" already exists.`);
    }
    
    // Foreign key simulation
    const category = await db.get('categories', (item as any).categoryId);
    if (!category) {
      throw new Error(`Category with ID "${(item as any).categoryId}" does not exist.`);
    }
  }

  await db.add(storeName, item);
}

export async function update<T extends { id: string; updatedAt?: string }>(
  storeName: StoreNames<any>, 
  data: T
): Promise<void> {
  const db = await initDB();
  const now = new Date().toISOString();
  
  const existing = await db.get(storeName, data.id);
  if (!existing) throw new Error(`Item with ID ${data.id} not found in ${storeName}`);

  const item = {
    ...existing,
    ...data,
    updatedAt: now,
  };

  // Unique validation for products (excluding self)
  if (storeName === 'products' && (data as any).name) {
    const products = await db.getAll('products');
    if (products.some((p: any) => p.id !== data.id && p.name.toLowerCase() === (data as any).name.toLowerCase())) {
      throw new Error(`Another product with name "${(data as any).name}" already exists.`);
    }
  }

  await db.put(storeName, item);
}

export async function remove(storeName: StoreNames<any>, id: string): Promise<void> {
  const db = await initDB();
  await db.delete(storeName, id);
}

// Specific Transactional Helpers
export async function processSale(order: Order): Promise<void> {
  const db = await initDB();
  const settings = await getSettings();
  const tx = db.transaction(['sales', 'products', 'stockLogs'], 'readwrite');
  const now = new Date().toISOString();

  // 1. Save Order
  const orderWithTimestamps = {
    ...order,
    createdAt: now,
    updatedAt: now,
  };
  await tx.objectStore('sales').add(orderWithTimestamps);

  // 2. Update Stock & Log
  for (const item of order.items) {
    const product = await tx.objectStore('products').get(item.productId);
    if (product) {
      const newStock = product.stock - item.quantity;
      
      // Prevent negative stock if not allowed
      if (!settings.allowNegativeStock && newStock < 0) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      product.stock = newStock;
      product.updatedAt = now;
      await tx.objectStore('products').put(product);

      // Log stock change
      const log: StockLog = {
        id: crypto.randomUUID(),
        productId: item.productId,
        type: 'out',
        quantity: item.quantity,
        reason: `Sale #${order.id}`,
        timestamp: now,
        createdAt: now,
      };
      await tx.objectStore('stockLogs').add(log);
    }
  }

  await tx.done;
}

export async function adjustStock(productId: string, quantity: number, type: 'in' | 'out' | 'adjustment', reason: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(['products', 'stockLogs'], 'readwrite');
  const now = new Date().toISOString();

  const product = await tx.objectStore('products').get(productId);
  if (!product) throw new Error(`Product with ID ${productId} not found.`);

  const oldStock = product.stock;
  if (type === 'in') product.stock += quantity;
  else if (type === 'out') product.stock -= quantity;
  else if (type === 'adjustment') product.stock = quantity;

  product.updatedAt = now;
  await tx.objectStore('products').put(product);

  const log: StockLog = {
    id: crypto.randomUUID(),
    productId,
    type,
    quantity: type === 'adjustment' ? quantity - oldStock : quantity,
    reason,
    timestamp: now,
    createdAt: now,
  };
  await tx.objectStore('stockLogs').add(log);

  await tx.done;
}

export async function getSettings(): Promise<Settings> {
  const settings = await getById<Settings>('settings', 'default');
  if (settings) return settings;
  
  const now = new Date().toISOString();
  const defaultSettings: Settings = {
    id: 'default',
    // Branding
    appName: 'ShopManager POS',
    tagline: 'Local-First Advanced POS',
    companyName: 'My Shop',
    footerText: 'Powered by ShopManager',

    // Currency & Formatting
    currency: 'NPR',
    currencySymbol: 'NPR',
    locale: 'en-US',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',

    // UI & Display
    language: 'en',
    theme: 'light',
    primaryColor: '#4f46e5', // Indigo 600
    fontSize: 'medium',
    itemsPerPage: 10,
    showStockBadge: true,
    showLowStockWarning: true,
    enableAnimations: true,

    // Business Rules
    lowStockThreshold: 5,
    allowNegativeStock: false,
    defaultDiscountType: 'flat',
    maxDiscountPercentage: 100,
    taxEnabled: true,
    taxRate: 13, // Default VAT in Nepal

    // App Behavior
    autoClearCart: true,
    showReceiptPreview: true,
    enableSound: false,
    enableKeyboardShortcuts: true,

    createdAt: now,
    updatedAt: now,
  };
  return defaultSettings;
}

export async function getStorageInfo() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return null;
}

export async function resetAllData(): Promise<void> {
  const db = await initDB();
  const stores = ['categories', 'products', 'sales', 'settings', 'stockLogs'];
  const tx = db.transaction(stores, 'readwrite');
  for (const store of stores) {
    await tx.objectStore(store).clear();
  }
  await tx.done;
}

export async function exportBackup(): Promise<string> {
  const db = await initDB();
  const stores = ['categories', 'products', 'sales', 'settings', 'stockLogs'];
  const backup: Record<string, any[]> = {};
  
  for (const store of stores) {
    backup[store] = await db.getAll(store);
  }
  
  return JSON.stringify(backup, null, 2);
}

export async function importBackup(jsonString: string): Promise<void> {
  const backup = JSON.parse(jsonString);
  const db = await initDB();
  const stores = ['categories', 'products', 'sales', 'settings', 'stockLogs'];
  const tx = db.transaction(stores, 'readwrite');
  
  for (const storeName of stores) {
    if (backup[storeName] && Array.isArray(backup[storeName])) {
      const store = tx.objectStore(storeName);
      await store.clear();
      for (const item of backup[storeName]) {
        await store.add(item);
      }
    }
  }
  
  await tx.done;
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const db = await initDB();
  const existing = await getSettings();
  const now = new Date().toISOString();
  
  const updated = {
    ...existing,
    ...settings,
    id: 'default' as const,
    updatedAt: now,
  };
  
  await db.put('settings', updated);
}
