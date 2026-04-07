import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Database, 
  ShieldCheck, 
  Image as ImageIcon, 
  Type, 
  Coins, 
  Monitor, 
  Zap,
  Trash2,
  Download,
  Upload,
  RefreshCcw,
  Check,
  AlertTriangle,
  Loader2,
  Sun,
  Moon,
  FileSpreadsheet
} from 'lucide-react';
import { useSettings, useAdmin } from '../hooks/usePOS';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@shared/utils';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings();
  const { handleReset, handleExport, handleImport, handleExcelExport, handleExcelImport, storageInfo } = useAdmin();
  const [activeTab, setActiveTab] = useState<'branding' | 'currency' | 'ui' | 'business' | 'data'>('branding');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;

  const tabs = [
    { id: 'branding', label: t('Branding', 'ब्रान्डिङ'), icon: ImageIcon },
    { id: 'currency', label: t('Currency', 'मुद्रा'), icon: Coins },
    { id: 'ui', label: t('UI & Display', 'UI र प्रदर्शन'), icon: Monitor },
    { id: 'business', label: t('Business Rules', 'व्यापार नियमहरू'), icon: ShieldCheck },
    { id: 'data', label: t('Data Management', 'डाटा व्यवस्थापन'), icon: Database },
  ] as const;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full pb-24">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t('Settings', 'सेटिङ्हरू')}
          </h1>
        </div>
        <p className="text-gray-500 font-medium">
          {t('Configure your POS system exactly how you want it', 'तपाईंको POS प्रणालीलाई तपाईंले चाहेजस्तै कन्फिगर गर्नुहोस्')}
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "text-gray-500 hover:bg-white hover:text-indigo-600"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8"
            >
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.logo ? (
                          <img src={settings.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                        <Upload className="w-6 h-6 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">{t('App Logo', 'एप लोगो')}</h3>
                      <p className="text-sm text-gray-500">{t('Upload your shop logo', 'तपाईंको पसलको लोगो अपलोड गर्नुहोस्')}</p>
                      {settings.logo && (
                        <button 
                          onClick={() => updateSettings({ logo: undefined })}
                          className="text-xs font-bold text-red-500 mt-2 hover:underline"
                        >
                          {t('Remove Logo', 'लोगो हटाउनुहोस्')}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SettingInput 
                      label={t('App Name', 'एपको नाम')}
                      value={settings.appName}
                      onChange={(val) => updateSettings({ appName: val })}
                    />
                    <SettingInput 
                      label={t('Tagline', 'ट्यागलाइन')}
                      value={settings.tagline}
                      onChange={(val) => updateSettings({ tagline: val })}
                    />
                    <SettingInput 
                      label={t('Company Name', 'कम्पनीको नाम')}
                      value={settings.companyName}
                      onChange={(val) => updateSettings({ companyName: val })}
                    />
                    <SettingInput 
                      label={t('Footer Text', 'फुटर पाठ')}
                      value={settings.footerText}
                      onChange={(val) => updateSettings({ footerText: val })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'currency' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SettingInput 
                      label={t('Currency Code (e.g. USD)', 'मुद्रा कोड')}
                      value={settings.currency}
                      onChange={(val) => updateSettings({ currency: val })}
                    />
                    <SettingInput 
                      label={t('Currency Symbol', 'मुद्रा प्रतीक')}
                      value={settings.currencySymbol}
                      onChange={(val) => updateSettings({ currencySymbol: val })}
                    />
                    <SettingInput 
                      label={t('Locale (e.g. en-US)', 'लोकेल')}
                      value={settings.locale}
                      onChange={(val) => updateSettings({ locale: val })}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t('Decimal Places', 'दशमलव स्थानहरू')}</label>
                      <select 
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={settings.decimalPlaces}
                        onChange={(e) => updateSettings({ decimalPlaces: Number(e.target.value) })}
                      >
                        {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ui' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t('Language', 'भाषा')}</label>
                      <div className="flex gap-2">
                        {['en', 'ne'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => updateSettings({ language: lang as any })}
                            className={cn(
                              "flex-1 py-3 rounded-2xl font-bold border transition-all",
                              settings.language === lang 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-indigo-200"
                            )}
                          >
                            {lang === 'en' ? 'English' : 'नेपाली'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t('Theme', 'थिम')}</label>
                      <div className="flex gap-2">
                        {['light', 'dark', 'system'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => updateSettings({ theme: mode as any })}
                            className={cn(
                              "flex-1 py-3 rounded-2xl font-bold border transition-all capitalize",
                              settings.theme === mode 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-indigo-200"
                            )}
                          >
                            {t(mode, mode === 'light' ? 'हल्का' : mode === 'dark' ? 'गाढा' : 'प्रणाली')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t('Primary Color', 'प्राथमिक रङ')}</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          className="w-12 h-12 rounded-xl cursor-pointer border-none"
                          value={settings.primaryColor}
                          onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                        />
                        <span className="font-mono text-sm font-bold text-gray-500 uppercase">{settings.primaryColor}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t('Font Size', 'फन्ट साइज')}</label>
                      <select 
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={settings.fontSize}
                        onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
                      >
                        <option value="small">{t('Small', 'सानो')}</option>
                        <option value="medium">{t('Medium', 'मध्यम')}</option>
                        <option value="large">{t('Large', 'ठूलो')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <ToggleSetting 
                      label={t('Show Stock Badge', 'स्टक ब्याज देखाउनुहोस्')}
                      checked={settings.showStockBadge}
                      onChange={(val) => updateSettings({ showStockBadge: val })}
                    />
                    <ToggleSetting 
                      label={t('Show Low Stock Warning', 'कम स्टक चेतावनी देखाउनुहोस्')}
                      checked={settings.showLowStockWarning}
                      onChange={(val) => updateSettings({ showLowStockWarning: val })}
                    />
                    <ToggleSetting 
                      label={t('Enable Animations', 'एनिमेसनहरू सक्षम गर्नुहोस्')}
                      checked={settings.enableAnimations}
                      onChange={(val) => updateSettings({ enableAnimations: val })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t('Low Stock Threshold', 'कम स्टक थ्रेसहोल्ड')}</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={settings.lowStockThreshold}
                        onChange={(e) => updateSettings({ lowStockThreshold: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t('Default Tax Rate (%)', 'पूर्वनिर्धारित कर दर (%)')}</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={settings.taxRate}
                        onChange={(e) => updateSettings({ taxRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <ToggleSetting 
                      label={t('Allow Negative Stock', 'नकारात्मक स्टक अनुमति दिनुहोस्')}
                      checked={settings.allowNegativeStock}
                      onChange={(val) => updateSettings({ allowNegativeStock: val })}
                    />
                    <ToggleSetting 
                      label={t('Enable Tax by Default', 'पूर्वनिर्धारित रूपमा कर सक्षम गर्नुहोस्')}
                      checked={settings.taxEnabled}
                      onChange={(val) => updateSettings({ taxEnabled: val })}
                    />
                    <ToggleSetting 
                      label={t('Auto-clear Cart after Sale', 'बिक्री पछि कार्ट स्वतः खाली गर्नुहोस्')}
                      checked={settings.autoClearCart}
                      onChange={(val) => updateSettings({ autoClearCart: val })}
                    />
                    <ToggleSetting 
                      label={t('Show Receipt Preview', 'रसिद पूर्वावलोकन देखाउनुहोस्')}
                      checked={settings.showReceiptPreview}
                      onChange={(val) => updateSettings({ showReceiptPreview: val })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DataActionCard 
                      title={t('Export JSON', 'JSON निर्यात गर्नुहोस्')}
                      description={t('Download full system backup', 'पूर्ण प्रणाली ब्याकअप डाउनलोड गर्नुहोस्')}
                      icon={Download}
                      onClick={handleExport}
                      color="bg-indigo-50 text-indigo-600"
                    />
                    <DataActionCard 
                      title={t('Import JSON', 'JSON आयात गर्नुहोस्')}
                      description={t('Restore from a backup file', 'ब्याकअप फाइलबाट पुनर्स्थापना गर्नुहोस्')}
                      icon={Upload}
                      onClick={() => fileInputRef.current?.click()}
                      color="bg-blue-50 text-blue-600"
                    />
                    <DataActionCard 
                      title={t('Export Excel', 'Excel निर्यात गर्नुहोस्')}
                      description={t('Download products and categories', 'उत्पादन र वर्गहरू डाउनलोड गर्नुहोस्')}
                      icon={FileSpreadsheet}
                      onClick={handleExcelExport}
                      color="bg-green-50 text-green-600"
                    />
                    <DataActionCard 
                      title={t('Import Excel', 'Excel आयात गर्नुहोस्')}
                      description={t('Import products and categories', 'उत्पादन र वर्गहरू आयात गर्नुहोस्')}
                      icon={Upload}
                      onClick={() => excelInputRef.current?.click()}
                      color="bg-emerald-50 text-emerald-600"
                    />
                  </div>

                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="w-5 h-5 text-gray-400" />
                      <h3 className="font-black text-gray-900">{t('Storage Usage', 'भण्डारण प्रयोग')}</h3>
                    </div>
                    {storageInfo ? (
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all" 
                            style={{ width: `${(storageInfo.usage / storageInfo.quota) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                          <span>{(storageInfo.usage / 1024 / 1024).toFixed(2)} MB used</span>
                          <span>{(storageInfo.quota / 1024 / 1024 / 1024).toFixed(2)} GB total</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 font-medium">Storage estimation not available</p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setIsResetConfirmOpen(true)}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold"
                    >
                      <Trash2 className="w-5 h-5" />
                      {t('Reset All Data', 'सबै डाटा रिसेट गर्नुहोस्')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

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

      <ConfirmDialog 
        isOpen={isResetConfirmOpen}
        title={t('Reset Everything?', 'सबै रिसेट गर्ने?')}
        message={t('This will permanently delete all products, categories, and sales history. This action cannot be undone.', 'यसले सबै उत्पादनहरू, वर्गहरू, र बिक्री इतिहास स्थायी रूपमा मेटाउनेछ। यो कार्य पूर्ववत गर्न सकिँदैन।')}
        confirmLabel={t('Yes, Reset All', 'हो, सबै रिसेट गर्नुहोस्')}
        onConfirm={handleReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}

function SettingInput({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      <input 
        type="text"
        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ToggleSetting({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex justify-between items-center">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      <button 
        onClick={() => onChange(!checked)}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative",
          checked ? "bg-indigo-600" : "bg-gray-200"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
          checked ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}

function DataActionCard({ title, description, icon: Icon, onClick, color }: { title: string, description: string, icon: any, onClick: () => void, color: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-6 rounded-3xl border border-gray-50 bg-white hover:shadow-md transition-all text-left group"
    >
      <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-black text-gray-900">{title}</h4>
        <p className="text-xs text-gray-400 font-medium">{description}</p>
      </div>
    </button>
  );
}
