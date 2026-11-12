import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchThemes } from '../../services/api.js';
import { defaultThemes } from '../../constants/mockData.js';
import { ThemeCard } from '../themes/ThemeCard.jsx';
import { Tabs } from '../../components/common/Tabs.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { ArrowRight } from 'lucide-react';

export const TrendingThemes = () => {
  // Pre-seed with top 6 default themes for immediate rendering (2 rows of 3)
  const [themes, setThemes] = useState(defaultThemes.slice(0, 6));
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = ['All', 'Royal', 'Traditional', 'Floral', 'Destination'];

  useEffect(() => {
    setIsLoading(true);
    fetchThemes({ category: activeTab !== 'All' ? activeTab : undefined })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setThemes(data.slice(0, 6));
        } else {
          // Local fallback
          const filtered = defaultThemes.filter(
            (t) => activeTab === 'All' || t.category.toLowerCase() === activeTab.toLowerCase()
          );
          setThemes(filtered.slice(0, 6));
        }
      })
      .catch(() => {
        const filtered = defaultThemes.filter(
          (t) => activeTab === 'All' || t.category.toLowerCase() === activeTab.toLowerCase()
        );
        setThemes(filtered.slice(0, 6));
      })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B38738]">
            Regal Aesthetics
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#4A0E17] tracking-wide mt-1">
            Trending Invitation Themes
          </h2>
          <p className="text-xs sm:text-sm text-[#4A3B32]/85 max-w-lg mx-auto mt-2 leading-relaxed">
            Selected by modern Indian couples for their unique blend of cultural grandeur, botanical romance, and interactive finesse.
          </p>
          <FloralDivider className="w-40 h-3 text-[#C9A24A] mx-auto mt-3" />
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-1 max-w-full">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab)} />
        </div>

        {/* Themes Grid: 3 columns x 2 rows (6 themes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {isLoading && themes.length === 0
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
            : themes.map((theme) => (
                <ThemeCard key={theme.slug || theme.id || theme._id} theme={theme} />
              ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 sm:mt-12">
          <Link to="/themes">
            <Button variant="outline" size="lg" className="border-floral-gold/60 text-floral-burgundy">
              <span>View All Royal Themes</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
