import React, { useState, useMemo } from 'react';
import { useReports, useSettings, useSales } from '../hooks/usePOS';
import { TrendingUp, ShoppingBag, DollarSign, Loader2, Calendar, ArrowUpRight, Package } from 'lucide-react';
import { formatCurrency } from '@shared/utils';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

export default function ReportsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const { loading, getStats } = useReports();
  const { sales } = useSales();
  const { settings } = useSettings();

  const chartData = useMemo(() => {
    if (!sales.length) return [];

    const days = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const interval = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return interval.map(day => {
      const daySales = sales.filter(s => isSameDay(new Date(s.timestamp), day));
      return {
        date: format(day, 'MMM dd'),
        revenue: daySales.reduce((sum, s) => sum + s.total, 0),
        orders: daySales.length
      };
    });
  }, [sales, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const stats = getStats(period);
  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;
  const formatPrice = (amount: number) => formatCurrency(
    amount, 
    settings.currency, 
    settings.locale, 
    settings.currencySymbol,
    settings.decimalPlaces
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full pb-20 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title={t('Total Revenue', 'कुल राजस्व')}
          value={formatPrice(stats.totalRevenue)}
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
          value={formatPrice(stats.totalRevenue / (stats.totalOrders || 1))}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <section className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {t('Revenue Trend', 'राजस्व प्रवृत्ति')}
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Daily revenue overview</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                <span className="text-[10px] font-black text-gray-400 uppercase">Revenue</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                  labelStyle={{ fontWeight: 800, fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Top Selling Products */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {t('Top Products', 'उत्कृष्ट उत्पादनहरू')}
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Best performers</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.topProducts.length > 0 ? stats.topProducts.slice(0, 5).map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{product.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.quantity} units sold</p>
                  </div>
                </div>
                <p className="font-black text-indigo-600">
                  {formatPrice(product.revenue)}
                </p>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-10" />
                <p className="text-sm font-bold uppercase tracking-widest">{t('No data', 'डाटा छैन')}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Volume Chart */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {t('Order Volume', 'अर्डर भोल्युम')}
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Daily order count</p>
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Category Performance Placeholder */}
        <section className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">
            {t('Category Insights', 'वर्ग अन्तर्दृष्टि')}
          </h3>
          <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">
            {t('Detailed category-wise performance and inventory health metrics will be available in the next update.', 'विस्तृत वर्ग-वार प्रदर्शन र सूची स्वास्थ्य मेट्रिक्स अर्को अपडेटमा उपलब्ध हुनेछ।')}
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
