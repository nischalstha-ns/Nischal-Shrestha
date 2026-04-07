import React, { useRef, useState } from 'react';
import { useAdmin, useSettings } from '../hooks/usePOS';
import { 
  LayoutDashboard, 
  Package, 
  LayoutGrid, 
  History, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Loader2, 
  TrendingUp, 
  Activity,
  ArrowRight,
  RefreshCcw,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '@shared/utils';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminDashboard() {
  const { stats, stockLogs, loading, handleReset, handleExport, handleExcelExport, handleExcelImport, handleImport, refresh } = useAdmin();
  const { settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;
  const format = (amount: number) => formatCurrency(
    amount, 
    settings.currency, 
    settings.locale, 
    settings.currencySymbol,
    settings.decimalPlaces
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t('Admin Dashboard', 'प्रशासक ड्यासबोर्ड')}
          </h1>
          <p className="text-gray-500 font-medium">
            {t('System overview and controls', 'प्रणाली सिंहावलोकन र नियन्त्रणहरू')}
          </p>
        </div>
        <button 
          onClick={refresh}
          className="p-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('Total Products', 'कुल उत्पादनहरू'), value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', shadow: 'shadow-blue-100' },
          { label: t('Total Categories', 'कुल वर्गहरू'), value: stats.totalCategories, icon: LayoutGrid, color: 'text-purple-600', bg: 'bg-purple-50', shadow: 'shadow-purple-100' },
          { label: t('Total Sales', 'कुल बिक्री'), value: stats.totalSales, icon: History, color: 'text-green-600', bg: 'bg-green-50', shadow: 'shadow-green-100' },
          { label: t('Total Revenue', 'कुल राजस्व'), value: format(stats.totalRevenue), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', shadow: 'shadow-indigo-100' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col gap-4 relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full opacity-20 group-hover:scale-150 transition-transform`} />
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow} relative z-10`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management Links */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <Activity className="w-6 h-6 text-indigo-600" />
                  {t('Quick Management', 'द्रुत व्यवस्थापन')}
                </h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Direct access to core features</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { to: '/products', label: t('Manage Products', 'उत्पादनहरू व्यवस्थापन गर्नुहोस्'), icon: Package, desc: 'Add, edit and track inventory' },
                { to: '/categories', label: t('Manage Categories', 'वर्गहरू व्यवस्थापन गर्नुहोस्'), icon: LayoutGrid, desc: 'Organize products by type' },
                { to: '/history', label: t('Sales History', 'बिक्री इतिहास'), icon: History, desc: 'View all past transactions' },
                { to: '/reports', label: t('Detailed Reports', 'विस्तृत रिपोर्टहरू'), icon: TrendingUp, desc: 'Analyze business performance' },
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.to}
                  className="flex items-center gap-5 p-6 rounded-3xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 shadow-sm transition-all">
                    <link.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{link.label}</span>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{link.desc}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Stock Logs */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <History className="w-6 h-6 text-indigo-600" />
                  {t('Recent Stock Activity', 'भर्खरको स्टक गतिविधि')}
                </h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Latest inventory adjustments</p>
              </div>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
              {stockLogs.length === 0 ? (
                <div className="py-20 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-10 text-gray-400" />
                  <p className="font-black text-gray-400 uppercase tracking-widest">No stock activity yet</p>
                </div>
              ) : (
                stockLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-gray-50/50 border border-gray-50 hover:bg-white hover:border-gray-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        log.type === 'add' ? 'bg-green-100 text-green-600' : 
                        log.type === 'remove' ? 'bg-red-100 text-red-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{log.productName}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{log.reason || 'Manual Adjustment'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${
                        log.type === 'add' ? 'text-green-600' : 
                        log.type === 'remove' ? 'text-red-600' : 
                        'text-blue-600'
                      }`}>
                        {log.type === 'add' ? '+' : log.type === 'remove' ? '-' : ''}{log.quantity}
                      </p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Controls */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Database className="w-6 h-6 text-indigo-600" />
                {t('System Controls', 'प्रणाली नियन्त्रणहरू')}
              </h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Data & Backup management</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-4 p-5 rounded-3xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-indigo-500/20 transition-all font-black uppercase tracking-widest text-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                {t('Export Backup', 'ब्याकअप निर्यात गर्नुहोस्')}
              </button>
              
              <button
                onClick={() => excelInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-5 rounded-3xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white hover:shadow-xl hover:shadow-green-500/20 transition-all font-black uppercase tracking-widest text-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                {t('Import from Excel', 'Excel बाट आयात गर्नुहोस्')}
              </button>
              <input
                type="file"
                ref={excelInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleExcelImport(file);
                }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-5 rounded-3xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-xl hover:shadow-blue-500/20 transition-all font-black uppercase tracking-widest text-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                {t('Import Backup', 'ब्याकअप आयात गर्नुहोस्')}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
              />

              <div className="pt-6 mt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="w-full flex items-center gap-4 p-5 rounded-3xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-xl hover:shadow-red-500/20 transition-all font-black uppercase tracking-widest text-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  {t('Reset All Data', 'सबै डाटा रिसेट गर्नुहोस्')}
                </button>
                <p className="mt-4 text-[10px] text-gray-400 text-center px-4 font-bold uppercase tracking-widest leading-relaxed">
                  {t('Warning: This will permanently delete all your products, categories, and sales history.', 'चेतावनी: यसले तपाइँका सबै उत्पादनहरू, वर्गहरू, र बिक्री इतिहास स्थायी रूपमा मेटाउनेछ।')}
                </p>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <h3 className="font-black text-2xl mb-2 tracking-tight">ShopManager POS</h3>
              <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-8 opacity-80">
                Local-First Advanced POS
              </p>
              <div className="space-y-4 text-xs font-black text-indigo-100/60 uppercase tracking-[0.2em]">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Version</span>
                  <span className="text-white">2.5.0</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Database</span>
                  <span className="text-white">IndexedDB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <span className="flex items-center gap-2 text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onConfirm={() => {
          handleReset();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
        title={t('Reset All Data', 'सबै डाटा रिसेट गर्नुहोस्')}
        message={t('Are you sure you want to delete all data? This action cannot be undone.', 'के तपाईं पक्का सबै डाटा मेटाउन चाहनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।')}
      />
    </div>
  );
}
