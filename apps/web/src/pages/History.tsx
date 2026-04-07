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
          <div className="lg:col-span-2 overflow-y-auto space-y-4 pr-4 scrollbar-thin">
            {filteredSales.map((sale) => (
              <motion.button
                key={sale.id}
                layout
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedOrder(sale)}
                className={`w-full text-left p-6 rounded-[2rem] border transition-all flex items-center justify-between group relative overflow-hidden ${
                  selectedOrder?.id === sale.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200' 
                    : 'bg-white border-gray-100 text-gray-900 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5'
                }`}
              >
                {selectedOrder?.id === sale.id && (
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                )}
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    selectedOrder?.id === sale.id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}>
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-xl tracking-tight">#{sale.id.slice(0, 8)}</span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                        selectedOrder?.id === sale.id ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        {sale.status}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${selectedOrder?.id === sale.id ? 'text-white/70' : 'text-gray-400'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(sale.timestamp).toLocaleDateString()} • {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="text-right">
                    <div className="font-black text-2xl tracking-tighter">{format(sale.total)}</div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${selectedOrder?.id === sale.id ? 'text-white/70' : 'text-gray-400'}`}>
                      {sale.items.length} {t('items', 'वस्तुहरू')}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    selectedOrder?.id === sale.id ? 'bg-white/20' : 'bg-gray-50 text-gray-300 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                  }`}>
                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedOrder?.id === sale.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </div>
                </div>
              </motion.button>
            ))}
            {filteredSales.length === 0 && (
              <div className="h-96 flex flex-col items-center justify-center text-gray-300">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <History className="w-10 h-10 opacity-20" />
                </div>
                <p className="font-black text-gray-400 uppercase tracking-widest text-sm">{t('No sales found', 'कुनै बिक्री भेटिएन')}</p>
              </div>
            )}
          </div>

          {/* Order Detail (Desktop) */}
          <div className="hidden lg:block">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-500/5 p-10 sticky top-0 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -z-10 opacity-50" />
                  
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction Summary</p>
                    </div>
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Order ID</span>
                        <span className="text-sm font-black text-gray-900">#{selectedOrder.id}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Date & Time</span>
                        <span className="text-sm font-black text-gray-900">{new Date(selectedOrder.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Purchased Items</h3>
                      <div className="space-y-5 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                {item.quantity}x
                              </div>
                              <div>
                                <div className="font-black text-gray-900 text-sm">{item.name}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(item.price)} / unit</div>
                              </div>
                            </div>
                            <div className="font-black text-gray-900">{format(item.price * item.quantity)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 space-y-4">
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-gray-900">{format(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-red-400 uppercase tracking-widest">
                        <span>Discount</span>
                        <span>-{format(selectedOrder.discount)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Tax</span>
                        <span className="text-gray-900">{format(selectedOrder.tax || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Paid</p>
                          <span className="text-3xl font-black text-indigo-600 tracking-tighter">{format(selectedOrder.total)}</span>
                        </div>
                        <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          Paid
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 border-4 border-dashed border-gray-50 rounded-[3rem] p-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <History className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-black text-gray-400 uppercase tracking-widest text-sm text-center">Select an order to view details</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Detail Modal (Mobile) */}
          <AnimatePresence>
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-end lg:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedOrder(null)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="relative bg-white w-full rounded-t-[3rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
                >
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
                  
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction Summary</p>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all"
                    >
                      <ChevronRight className="w-6 h-6 rotate-90" />
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Order ID</span>
                        <span className="text-sm font-black text-gray-900 truncate block">#{selectedOrder.id}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Date & Time</span>
                        <span className="text-sm font-black text-gray-900 block">{new Date(selectedOrder.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Purchased Items</h3>
                      <div className="space-y-5">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 text-xs">
                                {item.quantity}x
                              </div>
                              <div>
                                <div className="font-black text-gray-900 text-sm">{item.name}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(item.price)} / unit</div>
                              </div>
                            </div>
                            <div className="font-black text-gray-900">{format(item.price * item.quantity)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 space-y-4">
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-gray-900">{format(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-red-400 uppercase tracking-widest">
                        <span>Discount</span>
                        <span>-{format(selectedOrder.discount)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Tax</span>
                        <span className="text-gray-900">{format(selectedOrder.tax || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Paid</p>
                          <span className="text-3xl font-black text-indigo-600 tracking-tighter">{format(selectedOrder.total)}</span>
                        </div>
                        <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          Paid
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
