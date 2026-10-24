import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchThemes } from '../../services/api.js';
import { ThemeCard } from '../themes/ThemeCard.jsx';
import { Tabs } from '../../components/common/Tabs.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { ArrowRight, Sparkles } from 'lucide-react';

export const TrendingThemes = () => {
  const [themes, setThemes] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const tabs = ['All', 'Royal', 'Traditional', 'Floral', 'Destination'];

  useEffect(() => {
    setIsLoading(true);
    fetchThemes({ category: activeTab !== 'All' ? activeTab : undefined })
      .then((data) => {
        setThemes(data.slice(0, 3)); // show top 3 on home
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-gold-700">
            Regal Aesthetics
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-royal-maroon-800 tracking-wide mt-1">
            Trending Invitation Themes
          </h2>
          <p className="text-xs sm:text-sm text-royal-brown-600 max-w-lg mx-auto mt-2">
            Selected by thousands of modern Indian couples for their unique blend of cultural grandeur and interactive finesse.
          </p>
          <FloralDivider className="w-40 h-3 text-royal-gold-500 mx-auto mt-3" />
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab)} />
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {themes.map((theme) => (
            <ThemeCard key={theme.slug || theme.id} theme={theme} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/themes">
            <Button variant="outline" size="lg" className="border-royal-gold-500">
              <span>View All 50+ Royal Themes</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
