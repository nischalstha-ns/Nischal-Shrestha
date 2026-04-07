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
    <div className="p-6 max-w-5xl mx-auto w-full pb-20">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-2xl shadow-indigo-200">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
              {t('Settings', 'सेटिङहरू')}
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
              {t('Configure your POS system preferences', 'तपाईंको POS प्रणाली प्राथमिकताहरू कन्फिगर गर्नुहोस्')}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-white p-3 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-2 sticky top-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-5 rounded-3xl font-black text-sm transition-all group relative overflow-hidden",
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200" 
                    : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                )}
              >
                {activeTab === tab.id && (
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                )}
                <tab.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110 relative z-10", activeTab === tab.id ? "text-white" : "text-gray-300 group-hover:text-indigo-600")} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm min-h-[600px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-bl-[10rem] -z-10" />
              {activeTab === 'branding' && (
                <div className="space-y-10">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shadow-lg shadow-indigo-500/5">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('Branding Settings', 'ब्रान्डिङ सेटिङहरू')}</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Customize your app appearance</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('App Logo', 'एप लोगो')}</label>
                    <div className="flex items-center gap-8">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group relative transition-all hover:border-indigo-300 hover:bg-indigo-50/30">
                        {settings.logo ? (
                          <img src={settings.logo} alt="Logo" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-gray-200" />
                        )}
                        <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-400 leading-relaxed mb-4 uppercase tracking-widest max-w-xs">
                          Upload a logo for your business. Recommended size: 512x512px.
                        </p>
                        {settings.logo && (
                          <button 
                            onClick={() => updateSettings({ logo: undefined })}
                            className="px-4 py-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                <div className="space-y-10">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-4 bg-green-50 rounded-2xl text-green-600 shadow-lg shadow-green-500/5">
                      <Coins className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('Currency & Localization', 'मुद्रा र स्थानीयकरण')}</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage money formats</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Decimal Places', 'दशमलव स्थानहरू')}</label>
                      <select 
                        className="w-full px-6 py-5 rounded-3xl border border-gray-100 bg-gray-50 font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all appearance-none"
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
                <div className="space-y-10">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-4 bg-purple-50 rounded-2xl text-purple-600 shadow-lg shadow-purple-500/5">
                      <Monitor className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('UI & Display', 'UI र प्रदर्शन')}</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Interface preferences</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Language', 'भाषा')}</label>
                      <div className="flex gap-3 p-1.5 bg-gray-50 rounded-[2rem] border border-gray-100">
                        {['en', 'ne'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => updateSettings({ language: lang as any })}
                            className={cn(
                              "flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all",
                              settings.language === lang 
                                ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10" 
                                : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {lang === 'en' ? 'English' : 'नेपाली'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Theme', 'थिम')}</label>
                      <div className="flex gap-3 p-1.5 bg-gray-50 rounded-[2rem] border border-gray-100">
                        {['light', 'dark', 'system'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => updateSettings({ theme: mode as any })}
                            className={cn(
                              "flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all capitalize",
                              settings.theme === mode 
                                ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10" 
                                : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {t(mode, mode === 'light' ? 'हल्का' : mode === 'dark' ? 'गाढा' : 'प्रणाली')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Primary Color', 'प्राथमिक रङ')}</label>
                      <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                        <input 
                          type="color" 
                          className="w-12 h-12 rounded-2xl cursor-pointer border-none bg-transparent"
                          value={settings.primaryColor}
                          onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                        />
                        <span className="font-mono text-sm font-black text-gray-900 uppercase tracking-widest">{settings.primaryColor}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Font Size', 'फन्ट साइज')}</label>
                      <select 
                        className="w-full px-6 py-5 rounded-3xl border border-gray-100 bg-gray-50 font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all appearance-none"
                        value={settings.fontSize}
                        onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
                      >
                        <option value="small">{t('Small', 'सानो')}</option>
                        <option value="medium">{t('Medium', 'मध्यम')}</option>
                        <option value="large">{t('Large', 'ठूलो')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-10 border-t border-gray-100">
                    <ToggleSetting 
                      label={t('Show Stock Badge', 'स्टक ब्याज देखाउनुहोस्')}
                      description="Display current stock levels on product cards"
                      checked={settings.showStockBadge}
                      onChange={(val) => updateSettings({ showStockBadge: val })}
                    />
                    <ToggleSetting 
                      label={t('Show Low Stock Warning', 'कम स्टक चेतावनी देखाउनुहोस्')}
                      description="Highlight products with critically low inventory"
                      checked={settings.showLowStockWarning}
                      onChange={(val) => updateSettings({ showLowStockWarning: val })}
                    />
                    <ToggleSetting 
                      label={t('Enable Animations', 'एनिमेसनहरू सक्षम गर्नुहोस्')}
                      description="Smooth transitions and interactive effects"
                      checked={settings.enableAnimations}
                      onChange={(val) => updateSettings({ enableAnimations: val })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="space-y-10">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 shadow-lg shadow-amber-500/5">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('Business Rules', 'व्यापार नियमहरू')}</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure operational logic</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Low Stock Threshold', 'कम स्टक थ्रेसहोल्ड')}</label>
                      <input 
                        type="number"
                        className="w-full px-6 py-5 rounded-3xl border border-gray-100 bg-gray-50 font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all"
                        value={settings.lowStockThreshold}
                        onChange={(e) => updateSettings({ lowStockThreshold: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Default Tax Rate (%)', 'पूर्वनिर्धारित कर दर (%)')}</label>
                      <input 
                        type="number"
                        className="w-full px-6 py-5 rounded-3xl border border-gray-100 bg-gray-50 font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all"
                        value={settings.taxRate}
                        onChange={(e) => updateSettings({ taxRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-10 border-t border-gray-100">
                    <ToggleSetting 
                      label={t('Allow Negative Stock', 'नकारात्मक स्टक अनुमति दिनुहोस्')}
                      description="Enable sales even when inventory is zero"
                      checked={settings.allowNegativeStock}
                      onChange={(val) => updateSettings({ allowNegativeStock: val })}
                    />
                    <ToggleSetting 
                      label={t('Enable Tax by Default', 'पूर्वनिर्धारित रूपमा कर सक्षम गर्नुहोस्')}
                      description="Automatically apply tax to new transactions"
                      checked={settings.taxEnabled}
                      onChange={(val) => updateSettings({ taxEnabled: val })}
                    />
                    <ToggleSetting 
                      label={t('Auto-clear Cart after Sale', 'बिक्री पछि कार्ट स्वतः खाली गर्नुहोस्')}
                      description="Reset billing screen after successful checkout"
                      checked={settings.autoClearCart}
                      onChange={(val) => updateSettings({ autoClearCart: val })}
                    />
                    <ToggleSetting 
                      label={t('Show Receipt Preview', 'रसिद पूर्वावलोकन देखाउनुहोस्')}
                      description="Display printable receipt after payment"
                      checked={settings.showReceiptPreview}
                      onChange={(val) => updateSettings({ showReceiptPreview: val })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-10">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-4 bg-red-50 rounded-2xl text-red-600 shadow-lg shadow-red-500/5">
                      <Database className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('Data Management', 'डाटा व्यवस्थापन')}</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Import, Export and Reset</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

                  <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100/50 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <Database className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">{t('Storage Usage', 'भण्डारण प्रयोग')}</h3>
                      </div>
                      {storageInfo ? (
                        <div className="space-y-4">
                          <div className="h-3 w-full bg-white rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(storageInfo.usage / storageInfo.quota) * 100}%` }}
                              className="h-full bg-indigo-600 rounded-full" 
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span>{(storageInfo.usage / 1024 / 1024).toFixed(2)} MB used</span>
                            <span>{(storageInfo.quota / 1024 / 1024 / 1024).toFixed(2)} GB total</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 font-medium">Storage estimation not available</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-100">
                    <button
                      onClick={() => setIsResetConfirmOpen(true)}
                      className="w-full flex items-center justify-center gap-4 p-6 rounded-3xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-2xl hover:shadow-red-500/20 transition-all font-black uppercase tracking-widest text-xs group"
                    >
                      <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      {t('Reset All System Data', 'सबै प्रणाली डाटा रिसेट गर्नुहोस्')}
                    </button>
                    <p className="mt-4 text-[10px] text-gray-400 text-center px-8 font-bold uppercase tracking-widest leading-relaxed">
                      This will permanently delete all your products, categories, and sales history. Please ensure you have a backup.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
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
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
      <input 
        type="text"
        className="w-full px-6 py-5 rounded-3xl border border-gray-100 bg-gray-50 font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl group hover:bg-indigo-50 transition-all">
      <div>
        <p className="font-black text-gray-900">{label}</p>
        {description && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{description}</p>}
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={cn(
          "w-14 h-7 rounded-full transition-all relative",
          checked ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-gray-300"
        )}
      >
        <div className={cn(
          "absolute top-1 w-5 h-5 bg-white rounded-full transition-all",
          checked ? "left-8" : "left-1"
        )} />
      </button>
    </div>
  );
}

function DataActionCard({ title, description, icon: Icon, onClick, color }: { title: string, description: string, icon: any, onClick: () => void, color: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-5 p-6 rounded-[2.5rem] border border-gray-50 bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left group"
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{description}</p>
      </div>
    </button>
  );
}
