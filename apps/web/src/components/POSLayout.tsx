import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, Settings, History, LayoutGrid, BarChart3, ShieldCheck } from 'lucide-react';
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
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col sticky top-0 h-screen">
        <div className="p-6 border-b flex items-center gap-3">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain" />
          ) : (
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="font-black text-lg tracking-tight leading-tight">{settings.appName}</h1>
            {settings.tagline && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{settings.tagline}</p>}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all",
                location.pathname === item.path
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t">
          <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest">
            {settings.footerText}
          </p>
        </div>
      </aside>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t flex justify-around p-2 z-50 pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all min-w-[64px]",
              location.pathname === item.path 
                ? "text-indigo-600 bg-indigo-50" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
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
