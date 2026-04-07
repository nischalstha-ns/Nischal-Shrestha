import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import POSLayout from '@web/components/POSLayout';

const BillingPage = lazy(() => import('@web/pages/Billing'));
const ProductsPage = lazy(() => import('@web/pages/Products'));
const CategoriesPage = lazy(() => import('@web/pages/Categories'));
const HistoryPage = lazy(() => import('@web/pages/History'));
const SettingsPage = lazy(() => import('@web/pages/Settings'));
const ReportsPage = lazy(() => import('@web/pages/Reports'));
const AdminDashboard = lazy(() => import('@web/pages/AdminDashboard'));

import { useSettings } from '@web/hooks/usePOS';
import { useNavigate } from 'react-router-dom';

function KeyboardShortcuts() {
  const { settings } = useSettings();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!settings.enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Key shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'b': navigate('/'); break;
          case 'p': navigate('/products'); break;
          case 'c': navigate('/categories'); break;
          case 'h': navigate('/history'); break;
          case 'r': navigate('/reports'); break;
          case 's': navigate('/settings'); break;
          case 'a': navigate('/admin'); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.enableKeyboardShortcuts, navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <KeyboardShortcuts />
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      }>
        <Routes>
          {/* POS Routes */}
          <Route path="/" element={<POSLayout><BillingPage /></POSLayout>} />
          <Route path="/products" element={<POSLayout><ProductsPage /></POSLayout>} />
          <Route path="/categories" element={<POSLayout><CategoriesPage /></POSLayout>} />
          <Route path="/history" element={<POSLayout><HistoryPage /></POSLayout>} />
          <Route path="/reports" element={<POSLayout><ReportsPage /></POSLayout>} />
          <Route path="/settings" element={<POSLayout><SettingsPage /></POSLayout>} />
          <Route path="/admin" element={<POSLayout><AdminDashboard /></POSLayout>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
