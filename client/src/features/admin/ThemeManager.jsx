import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchThemes,
  toggleThemePublish,
  deleteTheme,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/api.js';
import { ThemeBuilderWizard } from './ThemeBuilderWizard.jsx';
import {
  Plus,
  Edit2,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Layers,
  IndianRupee,
  Search,
  Filter,
  Play,
  MoreVertical,
  Trash2,
  ChevronDown,
  X,
  AlertCircle,
  Check,
  Tag,
} from 'lucide-react';

export const ThemeManager = ({ onThemesUpdate, initialTab = 'all' }) => {
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Mode: 'list' or 'wizard'
  const [viewMode, setViewMode] = useState('list');
  const [editingTheme, setEditingTheme] = useState(null);

  // Tabs: 'all' | 'video' | 'website'
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filter toolbar state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  // Dropdown menu state
  const [activeMenuThemeId, setActiveMenuThemeId] = useState(null);

  // Quick Preview Modal state
  const [previewTheme, setPreviewTheme] = useState(null);

  // Success alert
  const [toastMessage, setToastMessage] = useState('');

  // Dynamic Categories state for filtering
  const [categories, setCategories] = useState([]);

  const loadAllCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data || []);
    } catch (err) {
      console.warn('Failed to fetch categories for filtering:', err.message);
    }
  };

  const loadAllThemes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchThemes({ all: 'true' });
      setThemes(data || []);
      if (onThemesUpdate) onThemesUpdate();
    } catch (err) {
      setError(err.message || 'Failed to fetch themes from registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllThemes();
    loadAllCategories();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleTogglePublish = async (theme) => {
    const id = theme._id || theme.id;
    try {
      await toggleThemePublish(id);
      showToast(`Theme "${theme.name}" ${theme.isPublished ? 'unpublished' : 'published'} successfully.`);
      loadAllThemes();
      setActiveMenuThemeId(null);
    } catch (err) {
      alert(`Could not toggle status: ${err.message}`);
      
    }
  };

  const handleDeleteTheme = async (theme) => {
    const id = theme._id || theme.id;
    if (!window.confirm(`Are you sure you want to permanently delete "${theme.name}"?`)) {
      return;
    }

    try {
      const res = await deleteTheme(id);
      if (res?.archived) {
        showToast(`Theme "${theme.name}" is referenced by existing invitations and was safely archived.`);
      } else {
        showToast(`Theme "${theme.name}" removed from registry.`);
      }
      loadAllThemes();
      setActiveMenuThemeId(null);
    } catch (err) {
      alert(`Failed to delete theme: ${err.message}`);
    }
  };

  const handleOpenWizard = (themeToEdit = null) => {
    setEditingTheme(themeToEdit);
    setViewMode('wizard');
    setActiveMenuThemeId(null);
  };

  const handleWizardComplete = () => {
    setViewMode('list');
    setEditingTheme(null);
    showToast('Theme saved successfully!');
    loadAllThemes();
  };

  // Tab counts calculated from live Mongo Atlas data
  const allCount = themes.length;
  const videoCount = themes.filter((t) =>
    t.themeType === 'video' ||
    t.themeType === 'both' ||
    t.supportedFormats?.includes('Video Invitation')
  ).length;
  const websiteCount = themes.filter((t) =>
    t.themeType === 'website' ||
    t.themeType === 'both' ||
    t.supportedFormats?.includes('Interactive Website')
  ).length;

  // Filtered & Sorted Themes
  const filteredThemes = useMemo(() => {
    return themes
      .filter((t) => {
        // Tab Filter
        if (activeTab === 'video') {
          const isVideo =
            t.themeType === 'video' ||
            t.themeType === 'both' ||
            t.supportedFormats?.includes('Video Invitation');
          if (!isVideo) return false;
        } else if (activeTab === 'website') {
          const isWeb =
            t.themeType === 'website' ||
            t.themeType === 'both' ||
            t.supportedFormats?.includes('Interactive Website');
          if (!isWeb) return false;
        }

        // Category Filter
        if (categoryFilter !== 'All' && t.category !== categoryFilter) {
          return false;
        }

        // Status Filter
        if (statusFilter === 'active' && (!t.isPublished || t.status === 'archived' || t.isArchived)) return false;
        if (statusFilter === 'draft' && (t.isPublished || t.status === 'archived' || t.isArchived)) return false;
        if (statusFilter === 'archived' && t.status !== 'archived' && !t.isArchived) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = t.name?.toLowerCase().includes(q);
          const matchSlug = t.slug?.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
          if (!matchName && !matchSlug && !matchDesc && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.priceDisplay || 0) - (b.priceDisplay || 0);
        if (sortBy === 'price-desc') return (b.priceDisplay || 0) - (a.priceDisplay || 0);
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        // default 'latest'
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [themes, activeTab, categoryFilter, statusFilter, searchQuery, sortBy]);

  // If in Wizard Mode, render the 5-step ThemeBuilderWizard
  if (viewMode === 'wizard') {
    return (
      <ThemeBuilderWizard
        initialTheme={editingTheme}
        onComplete={handleWizardComplete}
        onCancel={() => {
          setViewMode('list');
          setEditingTheme(null);
        }}
      />
    );
  }

  // Helper for Theme Type display
  const getThemeTypeDisplay = (theme) => {
    if (theme.themeType === 'both') return 'Video + Website';
    if (theme.themeType === 'video') return 'Video Only';
    if (theme.themeType === 'website') return 'Website Only';
    if (
      theme.supportedFormats?.includes('Video Invitation') &&
      theme.supportedFormats?.includes('Interactive Website')
    ) {
      return 'Video + Website';
    }
    if (theme.supportedFormats?.includes('Video Invitation')) return 'Video Only';
    return 'Website Only';
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#1E040D] text-white text-xs font-semibold shadow-xl border border-rose-900/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Row (Exact match to reference screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Theme Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage your wedding invitation themes (video & website).
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenWizard(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Theme</span>
        </button>
      </div>

      {/* Top Format Tabs (All Themes / Video Themes / Website Themes) */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'all', label: `All Themes (${allCount})` },
          { id: 'video', label: `Video Themes (${videoCount})` },
          { id: 'website', label: `Website Themes (${websiteCount})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
                isActive
                  ? 'border-[#8B1D3B] text-[#8B1D3B]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar Row (Exact match to screenshot) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Categories Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name} {c.themeCount ? `(${c.themeCount})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="active">Active (Published)</option>
              <option value="draft">Inactive (Draft)</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs cursor-pointer"
            >
              <option value="latest">Sort By: Latest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search themes..."
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

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-16 text-center bg-white border border-gray-200 rounded-2xl shadow-2xs">
          <Loader2 className="w-8 h-8 text-[#8B1D3B] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Loading wedding theme collection...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button
            onClick={loadAllThemes}
            className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No themes found matching your criteria</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your category, status filter, or search keywords, or add a new theme.
          </p>
          <button
            type="button"
            onClick={() => handleOpenWizard(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Theme</span>
          </button>
        </div>
      ) : (
        /* Theme Card Grid (3 Columns on Desktop - Exact match to screenshot) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredThemes.map((theme) => {
            const id = theme._id || theme.id;
            const hasVideo =
              theme.themeType === 'video' ||
              theme.themeType === 'both' ||
              theme.videoUrl ||
              theme.supportedFormats?.includes('Video Invitation');

            const isMenuOpen = activeMenuThemeId === id;

            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={theme.coverImage}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Video Duration Badge (e.g. ▶ 00:30) */}
                  {hasVideo && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Play className="w-2.5 h-2.5 fill-white text-white" />
                      <span>{theme.videoDuration || '00:30'}</span>
                    </div>
                  )}

                  {/* Top-Right 3-Dots Menu Button */}
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveMenuThemeId(isMenuOpen ? null : id)}
                      className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 flex items-center justify-center transition-colors shadow-xs"
                      aria-label="Theme options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu Popup */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 text-xs">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(theme)}
                          className="w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          {theme.isPublished ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-amber-500" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenWizard(theme)}
                          className="w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                          <span>Edit Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTheme(theme)}
                          className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Theme</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-gray-900 group-hover:text-[#8B1D3B] transition-colors leading-snug">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getThemeTypeDisplay(theme)}
                    </p>
                  </div>

                  {/* Price & Status Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900 text-sm">
                        ₹{theme.priceDisplay}
                      </span>
                      {theme.offerPrice > 0 && theme.offerPrice < theme.priceDisplay && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{theme.priceDisplay}
                        </span>
                      )}
                    </div>

                    <div>
                      {theme.status === 'archived' || theme.isArchived ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
                          Archived
                        </span>
                      ) : theme.isPublished ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Edit & Preview (Exact match to screenshot) */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleOpenWizard(theme)}
                      className="w-full py-1.5 px-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewTheme(theme)}
                      className="w-full py-1.5 px-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3 h-3 text-gray-500" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Interactive Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" role="dialog">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden text-left animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800">
                  Theme Preview
                </span>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  {previewTheme.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={previewTheme.coverImage}
                  alt={previewTheme.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {previewTheme.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Category & Style</span>
                  <span className="font-bold text-gray-900">{previewTheme.category}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Price Display</span>
                  <span className="font-bold text-gray-900">₹{previewTheme.priceDisplay}</span>
                </div>
              </div>

              {previewTheme.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {previewTheme.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-100 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <a
                href={`/themes/${previewTheme.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B1D3B] hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Public Preview Page</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const themeToEdit = previewTheme;
                    setPreviewTheme(null);
                    handleOpenWizard(themeToEdit);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors"
                >
                  Edit Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
