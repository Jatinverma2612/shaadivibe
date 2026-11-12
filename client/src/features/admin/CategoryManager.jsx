import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/api.js';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Layers,
  Sparkles,
  ArrowUpDown,
  Tag,
  Eye,
} from 'lucide-react';

export const CategoryManager = ({ onCategoriesUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchCategories({ all: 'true' });
      setCategories(data || []);
      if (onCategoriesUpdate) onCategoriesUpdate();
    } catch (err) {
      setError(err.message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      displayOrder: cat.displayOrder ?? 0,
      isActive: cat.isActive !== false,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingCategory || prev.slug === autoSlug ? autoSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError('');

      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id;
        await updateCategory(id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          displayOrder: Number(formData.displayOrder) || 0,
          isActive: Boolean(formData.isActive),
        });
        showToast(`Category "${formData.name.trim()}" updated successfully.`);
      } else {
        await createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          displayOrder: Number(formData.displayOrder) || 0,
          isActive: Boolean(formData.isActive),
        });
        showToast(`Category "${formData.name.trim()}" created successfully.`);
      }

      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      setModalError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    const id = cat._id || cat.id;
    if (
      !window.confirm(
        `Are you sure you want to delete category "${cat.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteCategory(id);
      showToast(`Category "${cat.name}" deleted successfully.`);
      await loadCategories();
    } catch (err) {
      alert(`Deletion Safeguard: ${err.message}`);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive !== false).length;
    const totalThemes = categories.reduce((sum, c) => sum + (c.themeCount || 0), 0);
    const sortedByThemes = [...categories].sort((a, b) => (b.themeCount || 0) - (a.themeCount || 0));
    const mostPopular = sortedByThemes[0]?.name || 'N/A';

    return { total, active, totalThemes, mostPopular };
  }, [categories]);

  // Filtered & Sorted Categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (statusFilter === 'active' && cat.isActive === false) return false;
        if (statusFilter === 'inactive' && cat.isActive !== false) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = cat.name?.toLowerCase().includes(q);
          const matchSlug = cat.slug?.toLowerCase().includes(q);
          const matchDesc = cat.description?.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'themes') return (b.themeCount || 0) - (a.themeCount || 0);
        if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        // Default 'order'
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
  }, [categories, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#1E040D] text-white text-xs font-semibold shadow-xl border border-rose-900/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Category Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Organize themes by wedding category, style, and tradition across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadCategories}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Categories</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#8B1D3B] flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Categories</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">{stats.active}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Assigned Themes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">{stats.totalThemes}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Top Category</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-gray-900 tracking-tight truncate block">
              {stats.mostPopular}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs cursor-pointer"
          >
            <option value="order">Sort: Display Order</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="themes">Sort: Most Themes</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B1D3B] mb-2" />
            <p className="text-xs">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">No categories found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No categories match your search criteria. Try a different query.'
                  : 'Start by creating your first wedding theme category.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Category</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-16">Order</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug / Identifier</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Assigned Themes</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat._id || cat.name} className="hover:bg-gray-50/70 transition-colors">
                    {/* Order */}
                    <td className="py-3.5 px-4">
                      <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-mono font-bold text-xs flex items-center justify-center">
                        {cat.displayOrder ?? 0}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block text-xs">{cat.name}</span>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {cat.slug}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-gray-600 truncate text-xs" title={cat.description}>
                        {cat.description || <span className="text-gray-300 italic">No description</span>}
                      </p>
                    </td>

                    {/* Themes Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <Layers className="w-3 h-3" />
                        <span>{cat.themeCount || 0} themes</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          cat.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-300'
                        }`}
                      >
                        {cat.isActive !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-gray-500 hover:text-[#8B1D3B] hover:bg-rose-50 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Category"
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
        )}
      </div>

      {/* ========================================================
          CREATE / EDIT CATEGORY MODAL
         ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#8B1D3B] flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingCategory
                      ? 'Update category details and cascade to active themes'
                      : 'Define a new wedding category for invitation suites'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Royal Palace, Gujarati Lagna, Beach Destination"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Slug / URL Identifier
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    })
                  }
                  placeholder="e.g. royal-palace"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Lowercase letters, numbers and hyphens only.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) || 0 })
                    }
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Sort rank in public tabs.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Visibility</label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer text-xs text-gray-700 mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="text-[#8B1D3B] focus:ring-[#8B1D3B] rounded"
                    />
                    <span className="font-semibold text-xs">Active on Public Gallery</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category's style, aesthetic, and ceremony context..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

