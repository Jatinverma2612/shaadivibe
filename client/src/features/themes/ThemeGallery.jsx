import React, { useState, useEffect, useMemo } from 'react';
import { fetchThemes, fetchCategories } from '../../services/api.js';
import { defaultThemes } from '../../constants/mockData.js';
import { ThemeCard } from './ThemeCard.jsx';
import { Tabs } from '../../components/common/Tabs.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const ThemeGallery = () => {
  // Pre-seed with defaultThemes to eliminate blank layout shift on first load
  const [themes, setThemes] = useState(defaultThemes);
  const [allThemes, setAllThemes] = useState(defaultThemes);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Visible count pagination: 6 themes initially (3 cols x 2 rows)
  const [visibleCount, setVisibleCount] = useState(6);

  // Filters state
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const formats = [
    { id: 'All', label: 'All Formats' },
    { id: 'Interactive Website', label: 'Interactive Website' },
    { id: 'Video Invitation', label: 'Video Invitation' },
  ];

  // Load themes from API, gracefully falling back to constants
  const loadThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedFormat !== 'All') params.format = selectedFormat;

      const data = await fetchThemes(params);
      if (Array.isArray(data) && data.length > 0) {
        setThemes(data);
      } else if (activeCategory === 'All' && !searchQuery.trim() && selectedFormat === 'All') {
        setThemes(defaultThemes);
      } else {
        setThemes(data || []);
      }
    } catch (err) {
      console.warn('[ThemeGallery] Error fetching themes, using local data:', err.message);
      // Fallback filter
      let filtered = [...defaultThemes];
      if (activeCategory !== 'All') {
        filtered = filtered.filter((t) => t.category.toLowerCase() === activeCategory.toLowerCase());
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
      }
      if (selectedFormat !== 'All') {
        filtered = filtered.filter((t) => t.supportedFormats?.includes(selectedFormat));
      }
      setThemes(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load to sync full dataset and categories
  useEffect(() => {
    fetchThemes({})
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllThemes(data);
        }
      })
      .catch(() => {});

    fetchCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch((err) => console.warn('[ThemeGallery] Error fetching categories:', err.message));
  }, []);

  useEffect(() => {
    setVisibleCount(6);
    loadThemes();
  }, [activeCategory, selectedFormat]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setVisibleCount(6);
    loadThemes();
  };

  // Compute dynamic category tabs with real item counts
  const dynamicCategories = useMemo(() => {
    const counts = { All: allThemes.length };
    allThemes.forEach((t) => {
      const cat = t.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryNames = categories.length > 0
      ? ['All', ...categories.map((c) => c.name)]
      : ['All', 'Royal', 'Traditional', 'Floral', 'Minimal', 'Modern', 'Cartoon', 'Destination', 'Regional'];

    const uniqueCats = Array.from(new Set(categoryNames));

    return uniqueCats.map((cat) => ({
      id: cat,
      label: cat,
      count: counts[cat] || 0,
    }));
  }, [allThemes, categories]);

  // Client-side sorting
  const sortedThemes = useMemo(() => {
    return [...themes].sort((a, b) => {
      if (sortBy === 'price-low') return (a.priceDisplay || 0) - (b.priceDisplay || 0);
      if (sortBy === 'price-high') return (b.priceDisplay || 0) - (a.priceDisplay || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // featured default
    });
  }, [themes, sortBy]);

  const displayedThemes = useMemo(() => {
    return sortedThemes.slice(0, visibleCount);
  }, [sortedThemes, visibleCount]);

  const handleResetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSelectedFormat('All');
    setSortBy('featured');
    setVisibleCount(6);
    setThemes(allThemes.length > 0 ? allThemes : defaultThemes);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title & Introduction */}
      <div className="text-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B38738]">
          Curated Royal Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A0E17] tracking-wide mt-1">
          Wedding Invitation Theme Gallery
        </h1>
        <p className="text-xs sm:text-sm text-[#4A3B32]/85 max-w-xl mx-auto mt-2 leading-relaxed">
          From majestic Rajasthani palace aesthetics to vibrant Vedic marigold rituals and modern minimalist serifs, discover the perfect invitation for your sacred union.
        </p>
        <FloralDivider className="w-40 h-3 text-[#C9A24A] mx-auto mt-3" />
      </div>

      {/* Category Tabs with Dynamic Counts */}
      <div className="flex justify-center mb-6 overflow-x-auto pb-1 max-w-full">
        <Tabs
          tabs={dynamicCategories}
          activeTab={activeCategory}
          onChange={(cat) => {
            setVisibleCount(6);
            setActiveCategory(cat);
          }}
        />
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="bg-white border border-[#EADCC8] rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search themes (e.g. Udaipur, Marigold, Pastel)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#EADCC8] bg-[#FFF9F4] text-[#49352F] focus:outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A]"
              />
              <Search className="w-4 h-4 text-[#B38738] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <Button type="submit" variant="primary" size="sm" className="text-xs px-4">
              Search
            </Button>
          </form>

          {/* Format Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedFormat}
              onChange={(e) => {
                setVisibleCount(6);
                setSelectedFormat(e.target.value);
              }}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#EADCC8] bg-[#FFF9F4] text-[#49352F] focus:outline-none focus:border-[#C9A24A]"
              aria-label="Filter by invitation format"
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
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#EADCC8] bg-[#FFF9F4] text-[#49352F] focus:outline-none focus:border-[#C9A24A]"
              aria-label="Sort themes"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-2xl max-w-lg mx-auto mb-8">
          <AlertCircle className="w-7 h-7 text-red-600 mx-auto mb-2" />
          <h3 className="font-serif text-base font-bold text-red-800">Notice</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <Button variant="outline" size="sm" onClick={loadThemes} className="mt-3">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedThemes.length === 0 && (
        <div className="py-12 text-center border-2 border-dashed border-[#EADCC8] rounded-2xl bg-white max-w-md mx-auto p-6 shadow-xs">
          <Sparkles className="w-8 h-8 text-[#B38738] mx-auto mb-2.5" />
          <h3 className="font-serif text-lg font-bold text-[#4A0E17]">
            No Themes Match Your Selection
          </h3>
          <p className="text-xs text-[#4A3B32]/80 mt-1.5 leading-relaxed">
            Try adjusting your search terms or reset filters to explore our complete wedding theme collection.
          </p>
          <Button variant="gold" size="sm" onClick={handleResetFilters} className="mt-4">
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Themes Grid: 3 columns desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {isLoading && displayedThemes.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#EADCC8] bg-white p-4 space-y-4 animate-pulse shadow-xs"
              >
                <div className="aspect-[16/10] rounded-xl bg-[#FAF2EB]" />
                <div className="h-4 bg-[#FAF2EB] rounded w-2/3" />
                <div className="h-3 bg-[#FAF2EB]/70 rounded w-full" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 bg-[#FAF2EB] rounded-xl flex-1" />
                  <div className="h-8 bg-[#FAF2EB] rounded-xl flex-1" />
                </div>
              </div>
            ))
          : displayedThemes.map((theme) => (
              <ThemeCard key={theme.slug || theme.id || theme._id} theme={theme} />
            ))}
      </div>

      {/* Load More Pagination */}
      {!isLoading && sortedThemes.length > visibleCount && (
        <div className="text-center pt-10">
          <Button
            variant="outline"
            size="md"
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="px-6 py-2.5 text-xs font-semibold rounded-full border border-[#C9A24A]/60 text-[#72092C] hover:bg-[#FAF2EB] transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#B38738]" />
            Load More Themes ({sortedThemes.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};
