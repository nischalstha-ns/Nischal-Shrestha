import { create } from 'zustand';
import type { Product, Order } from '@shared/types';
import { getAll, processSale } from './db/index';

interface POSState {
  products: Product[];
  cart: { product: Product; quantity: number }[];
  isLoading: boolean;
  setProducts: (products: Product[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  checkout: (discount: number, discountType: 'flat' | 'percentage') => Promise<void>;
  loadProducts: () => Promise<void>;
}

export const usePOSStore = create<POSState>((set, get) => ({
  products: [],
  cart: [],
  isLoading: false,
  setProducts: (products) => set({ products }),
  addToCart: async (product) => {
    const { cart } = get();
    const { getSettings } = await import('./db/index');
    const settings = await getSettings();

    const existing = cart.find((item) => item.product.id === product.id);
    if (!settings.allowNegativeStock && existing && existing.quantity >= product.stock) {
      alert('Cannot exceed available stock');
      return;
    }

    if (existing) {
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { product, quantity: 1 }] });
    }
  },
  removeFromCart: (productId) => {
    const { cart } = get();
    set({ cart: cart.filter((item) => item.product.id !== productId) });
  },
  updateCartQuantity: async (productId, delta) => {
    const { cart } = get();
    const { getSettings } = await import('./db/index');
    const settings = await getSettings();

    set({
      cart: cart.map((item) => {
        if (item.product.id === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          if (!settings.allowNegativeStock && newQty > item.product.stock) {
            alert('Cannot exceed available stock');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    });
  },
  clearCart: () => set({ cart: [] }),
  checkout: async (discount: number, discountType: 'flat' | 'percentage') => {
    const { cart, clearCart } = get();
    if (cart.length === 0) return;

    const { getSettings } = await import('./db/index');
    const settings = await getSettings();

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
    const tax = (subtotal - discountAmount) * (settings.taxRate / 100);
    const total = Math.max(0, subtotal - discountAmount + tax);

    const order: Order = {
      id: crypto.randomUUID(),
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      tax,
      discount: discountAmount,
      discountType,
      total,
      timestamp: new Date().toISOString(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await processSale(order);
      if (settings.autoClearCart) {
        clearCart();
      }
      // Refresh products to reflect stock changes
      await get().loadProducts();
    } catch (error: any) {
      alert(error.message || 'Failed to complete sale');
      throw error;
    }
  },
  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await getAll<Product>('products');
      set({ products });
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
