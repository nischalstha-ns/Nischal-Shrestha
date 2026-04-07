import React, { useState } from 'react';
import { useReports, useSettings } from '../hooks/usePOS';
import { TrendingUp, ShoppingBag, DollarSign, Loader2, Calendar, ArrowUpRight, Package } from 'lucide-react';
import { formatCurrency } from '@shared/utils';
import { motion } from 'motion/react';

export default function ReportsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('day');
  const { loading, getStats } = useReports();
  const { settings } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const stats = getStats(period);
  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;
  const format = (amount: number) => formatCurrency(
    amount, 
    settings.currency, 
    settings.locale, 
    settings.currencySymbol,
    settings.decimalPlaces
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t('Sales Reports', 'बिक्री रिपोर्ट')}
          </h1>
          <p className="text-gray-500 font-medium">
            {t('Track your business performance', 'तपाईंको व्यवसाय प्रदर्शन ट्र्याक गर्नुहोस्')}
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {(['day', 'week', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                period === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t(p.charAt(0).toUpperCase() + p.slice(1), 
                p === 'day' ? 'आज' : p === 'week' ? 'हप्ता' : p === 'month' ? 'महिना' : 'सबै')}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title={t('Total Revenue', 'कुल राजस्व')}
          value={format(stats.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-50 text-green-600"
        />
        <StatCard 
          title={t('Total Orders', 'कुल अर्डरहरू')}
          value={stats.totalOrders.toString()}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          title={t('Avg. Order Value', 'औसत अर्डर मूल्य')}
          value={format(stats.totalRevenue / (stats.totalOrders || 1))}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">
              {t('Top Selling Products', 'सबैभन्दा धेरै बिक्ने उत्पादनहरू')}
            </h2>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.topProducts.length > 0 ? stats.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400 font-medium">{product.quantity} {t('units sold', 'एकाइ बिक्री भयो')}</p>
                  </div>
                </div>
                <p className="font-black text-indigo-600">
                  {format(product.revenue)}
                </p>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-10" />
                <p>{t('No sales data for this period', 'यस अवधिको लागि कुनै बिक्री डाटा छैन')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Sales Trend Placeholder */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">
            {t('Sales Trends', 'बिक्री प्रवृत्ति')}
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            {t('Visual charts and detailed analytics will appear here as you process more sales.', 'तपाईंले थप बिक्री प्रक्रिया गर्दा भिजुअल चार्टहरू र विस्तृत विश्लेषण यहाँ देखा पर्नेछ।')}
          </p>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
    >
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
    </motion.div>
  );
}
