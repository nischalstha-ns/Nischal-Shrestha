import React, { useState, useRef } from 'react';
import { useProducts, useCategories, useSettings } from '../hooks/usePOS';
import { Plus, Edit2, Trash2, Package, Loader2, Search, Filter, AlertCircle, Check, TrendingUp, Image as ImageIcon, Upload, X } from 'lucide-react';
import { formatCurrency } from '@shared/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    categoryId: '',
    stock: 0,
    minStock: 5,
    image: ''
  });

  const [adjustData, setAdjustData] = useState({
    quantity: 0,
    type: 'in' as 'in' | 'out' | 'adjustment',
    reason: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    try {
      const { adjustStock } = await import('../db/index');
      await adjustStock(adjustingProduct.id, adjustData.quantity, adjustData.type, adjustData.reason);
      setIsAdjustModalOpen(false);
      setAdjustingProduct(null);
      setAdjustData({ quantity: 0, type: 'in', reason: '' });
      // Refresh products
      window.location.reload(); // Simple refresh for now
    } catch (error: any) {
      alert(error.message);
    }
  };

  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;
  const format = (amount: number) => formatCurrency(
    amount, 
    settings.currency, 
    settings.locale, 
    settings.currencySymbol,
    settings.decimalPlaces
  );

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) return;

    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...formData });
      } else {
        await addProduct({ id: crypto.randomUUID(), ...formData });
      }
      closeModal();
    } catch (error: any) {
      alert(error.message || 'An error occurred while saving the product.');
    }
  };

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        stock: product.stock,
        minStock: product.minStock,
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: 0,
        categoryId: categories[0]?.id || '',
        stock: 0,
        minStock: 5,
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col min-h-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('Inventory', 'इन्भेन्टरी')}</h1>
          <p className="text-gray-500 font-medium">{t('Manage your products and stock levels', 'तपाईंको उत्पादनहरू र स्टक स्तरहरू व्यवस्थापन गर्नुहोस्')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" /> {t('Add Product', 'उत्पादन थप्नुहोस्')}
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('Search products...', 'उत्पादनहरू खोज्नुहोस्...')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="outline-none text-sm font-medium bg-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">{t('All Categories', 'सबै वर्गहरू')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">{t('Product', 'उत्पादन')}</th>
                    <th className="px-6 py-4">{t('Category', 'वर्ग')}</th>
                    <th className="px-6 py-4">{t('Price', 'मूल्य')}</th>
                    <th className="px-6 py-4">{t('Stock', 'स्टक')}</th>
                    <th className="px-6 py-4 text-right">{t('Actions', 'कार्यहरू')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5" />
                            )}
                          </div>
                          <span className="font-bold text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                          {categories.find(c => c.id === product.categoryId)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">
                        {format(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${product.stock <= product.minStock ? 'text-amber-600' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                          {product.stock <= product.minStock && (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setAdjustingProduct(product);
                              setIsAdjustModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            title="Adjust Stock"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                <Package className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-medium">No products found</p>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 truncate">{product.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {categories.find(c => c.id === product.categoryId)?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-600">{format(product.price)}</p>
                    <div className="flex items-center justify-end gap-1">
                      <span className={`text-xs font-black ${product.stock <= product.minStock ? 'text-amber-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </span>
                      {product.stock <= product.minStock && (
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => {
                      setAdjustingProduct(product);
                      setIsAdjustModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest"
                  >
                    <TrendingUp className="w-4 h-4" /> Stock
                  </button>
                  <button
                    onClick={() => openModal(product)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        deleteProduct(product.id);
                      }
                    }}
                    className="p-3 rounded-xl bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="py-20 text-center text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-10" />
                <p className="font-medium">No products found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl p-8 rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col items-center gap-4 mb-4">
                  <div className="relative w-32 h-32 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No Image</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-all"
                  >
                    <Upload className="w-4 h-4" /> Upload Image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Product Name</label>
                  <input
                    autoFocus
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    placeholder="e.g. Espresso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                  <select
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium appearance-none bg-white"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Price ({settings.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Min Stock Alert</label>
                  <input
                    type="number"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    value={formData.minStock || ''}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  />
                </div>

                <div className="flex gap-4 pt-4 md:col-span-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" /> {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {isAdjustModalOpen && adjustingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-2">Adjust Stock</h2>
              <p className="text-gray-500 mb-6 font-medium">{adjustingProduct.name} (Current: {adjustingProduct.stock})</p>
              
              <form onSubmit={handleAdjustStock} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Adjustment Type</label>
                  <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    {(['in', 'out', 'adjustment'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAdjustData({ ...adjustData, type: t })}
                        className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                          adjustData.type === t ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'
                        }`}
                      >
                        {t === 'in' ? 'Add' : t === 'out' ? 'Remove' : 'Set'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Quantity</label>
                  <input
                    autoFocus
                    type="number"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    value={adjustData.quantity || ''}
                    onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Reason</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    placeholder="e.g. Restock, Damaged, Correction"
                    value={adjustData.reason}
                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
