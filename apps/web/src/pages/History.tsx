import React, { useState } from 'react';
import { useSales, useSettings } from '../hooks/usePOS';
import { History, Loader2, Search, Calendar, ChevronRight, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@shared/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function HistoryPage() {
  const { sales, loading } = useSales();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.items.some(item => item.name.toLowerCase().includes(search.toLowerCase()))
  );

  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;
  const format = (amount: number) => formatCurrency(
    amount, 
    settings.currency, 
    settings.locale, 
    settings.currencySymbol,
    settings.decimalPlaces
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col min-h-0">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          {settings.language === 'ne' ? 'बिक्री इतिहास' : 'Sales History'}
        </h1>
        <p className="text-gray-500 font-medium">
          {settings.language === 'ne' ? 'विगतका लेनदेनहरू समीक्षा र व्यवस्थापन गर्नुहोस्' : 'Review and manage past transactions'}
        </p>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by Order ID or Product Name..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          {/* Sales List */}
          <div className="lg:col-span-2 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {filteredSales.map((sale) => (
              <motion.button
                key={sale.id}
                layout
                onClick={() => setSelectedOrder(sale)}
                className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center justify-between group ${
                  selectedOrder?.id === sale.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'bg-white border-gray-100 text-gray-900 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${selectedOrder?.id === sale.id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-lg">#{sale.id.slice(0, 8)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedOrder?.id === sale.id ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        {sale.status}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium ${selectedOrder?.id === sale.id ? 'text-white/70' : 'text-gray-400'}`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(sale.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-black text-xl">{format(sale.total)}</div>
                    <div className={`text-xs font-medium ${selectedOrder?.id === sale.id ? 'text-white/70' : 'text-gray-400'}`}>
                      {sale.items.length} {t('items', 'वस्तुहरू')}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${selectedOrder?.id === sale.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </div>
              </motion.button>
            ))}
            {filteredSales.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <History className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-medium">{t('No sales found', 'कुनै बिक्री भेटिएन')}</p>
              </div>
            )}
          </div>

          {/* Order Detail */}
          <div className="hidden lg:block">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 sticky top-0"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-6">Order Details</h2>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Order ID</span>
                      <span className="text-gray-900 font-black">#{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Date</span>
                      <span className="text-gray-900 font-bold">{new Date(selectedOrder.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Items</h3>
                      <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-400">{item.quantity} x {format(item.price)}</div>
                            </div>
                            <div className="font-bold text-gray-900">{format(item.price * item.quantity)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-medium">Subtotal</span>
                        <span className="text-gray-900 font-bold">{format(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-medium">Discount</span>
                        <span className="text-red-500 font-bold">-{format(selectedOrder.discount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-medium">Tax</span>
                        <span className="text-gray-900 font-bold">{format(selectedOrder.tax || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                        <span className="text-lg font-black text-gray-900">Total</span>
                        <span className="text-2xl font-black text-indigo-600">{format(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-[2.5rem] p-8">
                  <History className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-medium text-center">Select an order to view details</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
