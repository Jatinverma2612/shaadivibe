import React, { useState, useEffect } from 'react';
import { fetchThemes } from '../../services/api.js';
import { ThemeCard } from './ThemeCard.jsx';
import { Tabs } from '../../components/common/Tabs.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Search, SlidersHorizontal, Sparkles, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export const ThemeGallery = () => {
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    'All',
    'Royal',
    'Traditional',
    'Floral',
    'Minimal',
    'Modern',
    'Destination',
  ];

  const formats = [
    { id: 'All', label: 'All Formats' },
    { id: 'Interactive Website', label: 'Interactive Website' },
    { id: 'Video Invitation', label: 'Video Invitation (Format Only)' },
  ];

  const loadThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedFormat !== 'All') params.format = selectedFormat;

      const data = await fetchThemes(params);
      setThemes(data);
    } catch (err) {
      setError(err.message || 'Failed to load themes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, [activeCategory, selectedFormat]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadThemes();
  };

  // Client-side sorting
  const sortedThemes = [...themes].sort((a, b) => {
    if (sortBy === 'price-low') return (a.priceDisplay || 0) - (b.priceDisplay || 0);
    if (sortBy === 'price-high') return (b.priceDisplay || 0) - (a.priceDisplay || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // featured default
  });

  const handleResetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSelectedFormat('All');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title & Introduction */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-royal-gold-700">
          Curated Royal Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-royal-maroon-800 tracking-wide mt-1">
          Wedding Invitation Theme Gallery
        </h1>
        <p className="text-xs sm:text-sm text-royal-brown-600 max-w-xl mx-auto mt-2 leading-relaxed">
          From majestic Rajasthani palace aesthetics to vibrant Vedic marigold rituals and modern minimalist serifs, discover the perfect invitation for your sacred union.
        </p>
        <FloralDivider className="w-40 h-3 text-royal-gold-500 mx-auto mt-3" />
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center mb-8 overflow-x-auto pb-2">
        <Tabs
          tabs={categories}
          activeTab={activeCategory}
          onChange={(cat) => setActiveCategory(cat)}
        />
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="bg-royal-ivory-card border border-royal-gold-400/40 rounded-2xl p-4 sm:p-5 shadow-sm mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search themes by name or style (e.g. Udaipur, Marigold)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-royal-gold-400/40 bg-royal-ivory-warm/40 text-royal-brown-900 focus:outline-none focus:border-royal-gold-600"
              />
              <Search className="w-4 h-4 text-royal-gold-600 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <Button type="submit" variant="primary" size="sm" className="text-xs">
              Search
            </Button>
          </form>

          {/* Format Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-royal-gold-400/40 bg-royal-ivory-warm/40 text-royal-brown-800 focus:outline-none focus:border-royal-gold-600"
            >
              {formats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-royal-gold-400/40 bg-royal-ivory-warm/40 text-royal-brown-800 focus:outline-none focus:border-royal-gold-600"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-royal-gold-600 animate-spin mb-3" />
          <h3 className="font-serif text-lg font-bold text-royal-maroon-800">
            Fetching Auspicious Themes...
          </h3>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="font-serif text-lg font-bold text-red-800">Unable to load themes</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <Button variant="outline" size="sm" onClick={loadThemes} className="mt-4">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sortedThemes.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-royal-gold-300 rounded-2xl bg-royal-ivory-card max-w-lg mx-auto p-8">
          <Sparkles className="w-10 h-10 text-royal-gold-500 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-royal-maroon-800">
            No Themes Match Your Filters
          </h3>
          <p className="text-xs text-royal-brown-600 mt-2">
            Try adjusting your search keywords, format options, or reset all filters to view our full collection.
          </p>
          <Button variant="gold" size="sm" onClick={handleResetFilters} className="mt-5">
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Themes Grid */}
      {!isLoading && !error && sortedThemes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedThemes.map((theme) => (
            <ThemeCard key={theme.slug || theme.id} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
};
