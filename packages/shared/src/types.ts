export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string; // Base64
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  minStock: number;
  image?: string; // Base64
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountType: 'flat' | 'percentage';
  total: number;
  timestamp: string;
  status: 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Settings {
  id: 'default';
  // Branding
  logo?: string; // Base64
  appName: string;
  tagline: string;
  companyName: string;
  footerText: string;

  // Currency & Formatting
  currency: string;
  currencySymbol: string;
  locale: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;

  // UI & Display
  language: 'en' | 'ne';
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  itemsPerPage: number;
  showStockBadge: boolean;
  showLowStockWarning: boolean;
  enableAnimations: boolean;

  // Business Rules
  lowStockThreshold: number;
  allowNegativeStock: boolean;
  defaultDiscountType: 'flat' | 'percentage';
  maxDiscountPercentage: number;
  taxEnabled: boolean;
  taxRate: number;

  // App Behavior
  autoClearCart: boolean;
  showReceiptPreview: boolean;
  enableSound: boolean;
  enableKeyboardShortcuts: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface StockLog {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  timestamp: string;
  createdAt: string;
}
