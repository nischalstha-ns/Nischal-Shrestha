import React, { useState, useEffect } from 'react';
import { usePOSStore } from '../store';
import { ShoppingCart, Package, Loader2, Search, Trash2, Plus, Minus, Percent, DollarSign } from 'lucide-react';
import { formatCurrency } from '@shared/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts, useCategories, useSales, useSettings } from '../hooks/usePOS';
import type { Order, OrderItem } from '@shared/types';

export default function BillingPage() {
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const { settings, updateSettings } = useSettings();
  const { cart, addToCart, removeFromCart, updateCartQuantity, checkout, clearCart } = usePOSStore();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>(settings.defaultDiscountType);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    if (!settings.allowNegativeStock && product.stock <= 0) {
      alert('Out of stock!');
      return;
    }
    const existing = cart.find(item => item.product.id === product.id);
    if (!settings.allowNegativeStock && existing && existing.quantity >= product.stock) {
      alert('Cannot add more than available stock');
      return;
    }
    addToCart(product);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Enforce max discount percentage
  const effectiveDiscount = discountType === 'percentage' 
    ? Math.min(discount, settings.maxDiscountPercentage) 
    : discount;

  const discountAmount = discountType === 'percentage' ? (subtotal * effectiveDiscount) / 100 : effectiveDiscount;
  const taxAmount = settings.taxEnabled ? (subtotal - discountAmount) * (settings.taxRate / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount + taxAmount);

  const format = (amount: number) => formatCurrency(
    amount, 
    settings.currency, 
    settings.locale, 
    settings.currencySymbol,
    settings.decimalPlaces
  );
  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;

  const [lastOrder, setLastOrder] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const orderId = crypto.randomUUID();
      await checkout(discount, discountType);
      
      if (settings.showReceiptPreview) {
        setLastOrder({
          id: orderId,
          items: [...cart],
          subtotal,
          discount: discountAmount,
          tax: taxAmount,
          total,
          timestamp: new Date().toISOString()
        });
        setIsReceiptOpen(true);
      }
      
      setDiscount(0);
      if (!settings.showReceiptPreview) {
        alert('Sale completed successfully!');
      }
    } catch (error) {
      // Error is already alerted in store.ts
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
        <div className="p-4 border-b bg-white space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {productsLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToCart(product)}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-left flex flex-col relative group"
                >
                  {product.stock <= product.minStock && (
                    <span className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200">
                      Low Stock
                    </span>
                  )}
                  <div className="aspect-square bg-gray-50 rounded-xl mb-3 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <Package className="w-10 h-10 text-gray-300 group-hover:text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-indigo-600 font-extrabold">{format(product.price)}</span>
                    <span className="text-[10px] font-medium text-gray-400">Stock: {product.stock}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <aside className="w-full md:w-[400px] bg-white border-l flex flex-col shadow-2xl z-20">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-lg">Current Order</h2>
          </div>
          <button 
            onClick={() => clearCart()}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-medium">Your cart is empty</p>
                <p className="text-xs">Select products to start billing</p>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-50 p-3 rounded-xl border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                    <span className="font-bold text-indigo-600">
                      {format(item.product.price * item.quantity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(item.product.price)} / unit
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('Subtotal', 'उप-कुल')}</span>
              <span>{format(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>{t('Discount', 'छुट')}</span>
                <span>-{format(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-gray-500 items-center">
              <div className="flex items-center gap-2">
                <span>{t('Tax', 'कर')} ({settings.taxRate}%)</span>
                <button 
                  onClick={() => updateSettings({ taxEnabled: !settings.taxEnabled })}
                  className={`w-8 h-4 rounded-full transition-all relative ${settings.taxEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.taxEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
              <span>{format(taxAmount)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1">
                {discountType === 'percentage' ? <Percent className="w-4 h-4 text-gray-400 mr-2" /> : <DollarSign className="w-4 h-4 text-gray-400 mr-2" />}
                <input
                  type="number"
                  placeholder={t('Discount', 'छुट')}
                  className="w-full text-sm outline-none font-medium"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setDiscountType('flat')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${discountType === 'flat' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`}
                >
                  $
                </button>
                <button
                  onClick={() => setDiscountType('percentage')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${discountType === 'percentage' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`}
                >
                  %
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xl font-black pt-2 border-t border-gray-200">
              <span>{t('Grand Total', 'कुल जम्मा')}</span>
              <span className="text-indigo-600">{format(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
          >
            {t('Complete Sale', 'बिक्री पूरा गर्नुहोस्')}
          </button>
        </div>
      </aside>

      {/* Receipt Modal */}
      <AnimatePresence>
        {isReceiptOpen && lastOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReceiptOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="text-center mb-6">
                {settings.logo && <img src={settings.logo} alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />}
                <h2 className="text-xl font-black text-gray-900">{settings.companyName || settings.appName}</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{settings.tagline}</p>
              </div>

              <div className="border-t border-dashed border-gray-200 py-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span>#{lastOrder.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(lastOrder.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 py-4 space-y-3">
                {lastOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} x {format(item.product.price)}</p>
                    </div>
                    <p className="font-bold text-gray-900">{format(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 py-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{format(lastOrder.subtotal)}</span>
                </div>
                {lastOrder.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span>-{format(lastOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>{format(lastOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-2 text-indigo-600">
                  <span>Total</span>
                  <span>{format(lastOrder.total)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                >
                  <ShoppingCart className="w-5 h-5" /> Print Receipt
                </button>
                <button
                  onClick={() => setIsReceiptOpen(false)}
                  className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-all"
                >
                  Close
                </button>
              </div>

              <p className="mt-6 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                {settings.footerText}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
