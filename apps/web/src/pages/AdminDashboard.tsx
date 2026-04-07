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
          { label: t('Total Products', 'कुल उत्पादनहरू'), value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('Total Categories', 'कुल वर्गहरू'), value: stats.totalCategories, icon: LayoutGrid, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: t('Total Sales', 'कुल बिक्री'), value: stats.totalSales, icon: History, color: 'text-green-600', bg: 'bg-green-50' },
          { label: t('Total Revenue', 'कुल राजस्व'), value: format(stats.totalRevenue), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management Links */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              {t('Quick Management', 'द्रुत व्यवस्थापन')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { to: '/products', label: t('Manage Products', 'उत्पादनहरू व्यवस्थापन गर्नुहोस्'), icon: Package },
                { to: '/categories', label: t('Manage Categories', 'वर्गहरू व्यवस्थापन गर्नुहोस्'), icon: LayoutGrid },
                { to: '/history', label: t('Sales History', 'बिक्री इतिहास'), icon: History },
                { to: '/reports', label: t('Detailed Reports', 'विस्तृत रिपोर्टहरू'), icon: TrendingUp },
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.to}
                  className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="font-bold text-gray-700 group-hover:text-indigo-900">{link.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Stock Logs */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              {t('Recent Stock Activity', 'भर्खरको स्टक गतिविधि')}
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {stockLogs.length === 0 ? (
                <p className="text-center py-8 text-gray-400 font-medium">No stock activity yet</p>
              ) : (
                stockLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${
                        log.type === 'add' ? 'bg-green-100 text-green-600' : 
                        log.type === 'remove' ? 'bg-red-100 text-red-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{log.productName}</p>
                        <p className="text-xs text-gray-500">{log.reason || 'Manual Adjustment'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${
                        log.type === 'add' ? 'text-green-600' : 
                        log.type === 'remove' ? 'text-red-600' : 
                        'text-blue-600'
                      }`}>
                        {log.type === 'add' ? '+' : log.type === 'remove' ? '-' : ''}{log.quantity}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Controls */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              {t('System Controls', 'प्रणाली नियन्त्रणहरू')}
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all font-bold"
              >
                <Download className="w-5 h-5" />
                {t('Export Backup', 'ब्याकअप निर्यात गर्नुहोस्')}
              </button>
              
              <button
                onClick={() => excelInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100 transition-all font-bold"
              >
                <FileSpreadsheet className="w-5 h-5" />
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
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-bold"
              >
                <Upload className="w-5 h-5" />
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

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold"
                >
                  <Trash2 className="w-5 h-5" />
                  {t('Reset All Data', 'सबै डाटा रिसेट गर्नुहोस्')}
                </button>
                <p className="mt-2 text-[10px] text-gray-400 text-center px-4">
                  {t('Warning: This will permanently delete all your products, categories, and sales history.', 'चेतावनी: यसले तपाइँका सबै उत्पादनहरू, वर्गहरू, र बिक्री इतिहास स्थायी रूपमा मेटाउनेछ।')}
                </p>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
            <h3 className="font-black text-xl mb-2">ShopManager POS</h3>
            <p className="text-indigo-100 text-sm font-medium mb-6">
              Local-First Advanced Point of Sale System
            </p>
            <div className="space-y-2 text-xs font-bold text-indigo-200">
              <div className="flex justify-between">
                <span>Version</span>
                <span>2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Database</span>
                <span>IndexedDB (ShopManagerDB)</span>
              </div>
              <div className="flex justify-between">
                <span>Last Sync</span>
                <span>Local Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
