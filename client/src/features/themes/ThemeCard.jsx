import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';

export const ThemeCard = ({ theme }) => {
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('shaadivibe_favorites') || '[]');
      return favs.includes(theme.slug || theme.id);
    } catch {
      return false;
    }
  });

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      let favs = JSON.parse(localStorage.getItem('shaadivibe_favorites') || '[]');
      if (nextState) {
        favs.push(theme.slug || theme.id);
      } else {
        favs = favs.filter((id) => id !== (theme.slug || theme.id));
      }
      localStorage.setItem('shaadivibe_favorites', JSON.stringify(favs));
    } catch {}
  };

  return (
    <Card
      ornate={false}
      className="p-0 overflow-hidden flex flex-col justify-between group hover:border-royal-gold-500 hover:shadow-royal-lg transition-all duration-300 bg-royal-ivory-card border-2 border-royal-gold-400/30"
    >
      {/* Cover Media Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-royal-ivory-warm">
        <img
          src={theme.coverImage}
          alt={theme.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-royal-maroon-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="gold" size="sm">
            {theme.category}
          </Badge>
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-royal-maroon-700 hover:bg-white transition-colors shadow-sm"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-rose-600 text-rose-600' : 'text-royal-brown-600'
            }`}
          />
        </button>

        {/* Formats Pill */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-1.5">
          {theme.supportedFormats?.map((fmt, i) => (
            <span
              key={i}
              className="text-[10px] font-semibold bg-black/60 text-royal-gold-200 px-2 py-0.5 rounded backdrop-blur-sm"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-bold text-royal-maroon-800 tracking-wide group-hover:text-royal-maroon-600 transition-colors">
              {theme.name}
            </h3>
            {theme.priceDisplay > 0 && (
              <span className="text-xs font-bold text-royal-gold-800 bg-royal-gold-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                ₹{theme.priceDisplay}
              </span>
            )}
          </div>

          <p className="text-xs text-royal-brown-600 mt-2 line-clamp-2 leading-relaxed">
            {theme.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-royal-gold-400/20 flex items-center gap-2">
          <Link to={`/themes/${theme.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview
            </Button>
          </Link>
          <Link to={`/customize/${theme.slug}`} className="flex-1">
            <Button variant="gold" size="sm" className="w-full text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Select
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
