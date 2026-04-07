import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, ShoppingBag, TrendingUp, DollarSign, Package } from 'lucide-react';
import { formatCurrency } from '@shared/utils';
import { motion } from 'motion/react';
import { getAll } from '@web/db/index';
import type { Order } from '@shared/types';

export default function AdminApp() {
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const sales = await getAll<Order>('sales');
      const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
      setStats({
        totalSales,
        totalOrders: sales.length
      });
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
            <TrendingUp className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <ShoppingBag className="w-5 h-5" /> Sales
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Package className="w-5 h-5" /> Inventory
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Users className="w-5 h-5" /> Customers
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500">Welcome back, here's what's happening today.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Sales" 
            value={formatCurrency(stats.totalSales, 'USD')} 
            icon={<DollarSign className="w-6 h-6" />} 
            trend="+12.5%"
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders.toString()} 
            icon={<ShoppingBag className="w-6 h-6" />} 
            trend="+8.2%"
          />
          <StatCard 
            title="Active Customers" 
            value="1,284" 
            icon={<Users className="w-6 h-6" />} 
            trend="+15.3%"
          />
          <StatCard 
            title="Avg. Order Value" 
            value={formatCurrency(stats.totalSales / (stats.totalOrders || 1), 'USD')} 
            icon={<TrendingUp className="w-6 h-6" />} 
            trend="-2.1%"
          />
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-80 flex items-center justify-center text-gray-400">
            Sales Chart Placeholder
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-80 flex items-center justify-center text-gray-400">
            Top Products Placeholder
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          {icon}
        </div>
        <span className={`text-sm font-bold ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}
