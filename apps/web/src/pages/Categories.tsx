import React, { useState, useRef } from 'react';
import { useCategories, useSettings } from '../hooks/usePOS';
import { Plus, Edit2, Trash2, LayoutGrid, Loader2, X, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CategoriesPage() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (en: string, ne: string) => settings.language === 'ne' ? ne : en;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory({ ...editingCategory, ...formData });
      } else {
        await addCategory({ id: crypto.randomUUID(), ...formData });
      }
      closeModal();
    } catch (error: any) {
      alert(error.message || 'An error occurred while saving the category.');
    }
  };

  const openModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name, 
        description: category.description || '',
        image: category.image || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t('Categories', 'वर्गहरू')}
          </h1>
          <p className="text-gray-500 font-medium">
            {t('Manage your product categories', 'तपाईंको उत्पादन वर्गहरू व्यवस्थापन गर्नुहोस्')}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" /> {t('Add Category', 'वर्ग थप्नुहोस्')}
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <motion.div
              layout
              key={cat.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <LayoutGrid className="w-8 h-8" />
                  )}
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(cat)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this category?')) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{cat.description || 'No description provided.'}</p>
            </motion.div>
          ))}
        </div>
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
              className="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-6">
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

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Category Name</label>
                  <input
                    autoFocus
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    placeholder="e.g. Beverages"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium resize-none"
                    placeholder="Brief description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-4 pt-2">
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
                    <Check className="w-5 h-5" /> {editingCategory ? 'Update' : 'Create'}
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
