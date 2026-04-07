import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, Settings, History, LayoutGrid, BarChart3, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { usePOSStore } from '../store';
import { useSettings } from '../hooks/usePOS';
import { cn } from '@shared/utils';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { loadProducts } = usePOSStore();
  const { settings } = useSettings();

  useEffect(() => {
    loadProducts();
  }, []);

  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;

  const navItems = [
    { path: '/', icon: ShoppingCart, label: t('Billing', 'बिलिङ') },
    { path: '/products', icon: Package, label: t('Products', 'उत्पादनहरू') },
    { path: '/categories', icon: LayoutGrid, label: t('Categories', 'वर्गहरू') },
    { path: '/history', icon: History, label: t('History', 'इतिहास') },
    { path: '/reports', icon: BarChart3, label: t('Reports', 'रिपोर्टहरू') },
    { path: '/admin', icon: ShieldCheck, label: t('Admin', 'प्रशासक') },
    { path: '/settings', icon: Settings, label: t('Settings', 'सेटिङ्हरू') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-3">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="w-8 h-8 object-contain" />
          ) : (
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
              <Package className="w-4 h-4 text-white" />
            </div>
          )}
          <h1 className="font-black text-lg tracking-tight text-gray-900 truncate max-w-[150px]">{settings.appName}</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
          AD
        </div>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r flex-col sticky top-0 h-screen shadow-sm z-30">
        <div className="p-8 flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-2 bg-indigo-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all" />
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-12 h-12 object-contain relative" />
            ) : (
              <div className="bg-indigo-600 p-3 rounded-2xl relative shadow-lg shadow-indigo-100">
                <Package className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-xl tracking-tight leading-tight text-gray-900 truncate">{settings.appName}</h1>
            {settings.tagline && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{settings.tagline}</p>}
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-none">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Main Menu', 'मुख्य मेनु')}</p>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all relative group",
                location.pathname === item.path
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                  : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-indigo-600")} />
              <span className="flex-1">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">Admin User</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manager</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-300 font-bold text-center uppercase tracking-[0.2em]">
            {settings.footerText}
          </p>
        </div>
      </aside>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t flex justify-around p-2 z-50 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all min-w-[64px] relative",
              location.pathname === item.path 
                ? "text-indigo-600" 
                : "text-gray-400"
            )}
          >
            {location.pathname === item.path && (
              <motion.div 
                layoutId="activeNavMobile"
                className="absolute inset-0 bg-indigo-50 rounded-2xl -z-10"
              />
            )}
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
