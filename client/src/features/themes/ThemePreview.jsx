import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchThemeBySlug } from '../../services/api.js';
import { defaultThemes } from '../../constants/mockData.js';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider, LotusMotif, DiyaMotif } from '../../components/common/Motifs.jsx';
import {
  Sparkles,
  Eye,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Heart,
  Palette,
} from 'lucide-react';

export const ThemePreview = () => {
  const { slug } = useParams();
  const [theme, setTheme] = useState(() => defaultThemes.find((t) => t.slug === slug) || null);
  const [isLoading, setIsLoading] = useState(!theme);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(theme?.coverImage || '');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchThemeBySlug(slug)
      .then((data) => {
        setTheme(data);
        setActiveImage(data.coverImage);
      })
      .catch((err) => {
        const fallback = defaultThemes.find((t) => t.slug === slug);
        if (fallback) {
          setTheme(fallback);
          setActiveImage(fallback.coverImage);
        } else {
          setError(err.message || 'Theme not found');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading && !theme) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 text-floral-gold animate-spin mb-3" />
        <h3 className="font-serif text-lg font-bold text-floral-burgundy">
          Loading Theme Preview...
        </h3>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white border border-floral-gold/40 rounded-2xl shadow-royal">
        <Heart className="w-12 h-12 text-floral-burgundy mx-auto mb-3 opacity-60" />
        <h2 className="font-serif text-2xl font-bold text-floral-burgundy">
          Theme Not Found
        </h2>
        <p className="text-xs text-floral-brown/80 mt-2 mb-6">
          The requested theme "{slug}" could not be located in our royal registry.
        </p>
        <Link to="/themes">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explore All Themes
          </Button>
        </Link>
      </div>
    );
  }

  const primaryColor = theme.colorPalette?.primary || '#5C061D';
  const secondaryColor = theme.colorPalette?.secondary || '#C9A24A';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Badge */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/themes"
          className="inline-flex items-center text-xs font-semibold text-floral-gold hover:text-floral-burgundy transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Theme Gallery</span>
        </Link>

        <Badge variant="gold" size="md">
          {theme.category} Collection
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Visual Theme Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-floral-gold/40 shadow-royal-lg bg-floral-blush/40 flex items-center justify-center">
            {!imageError && (activeImage || theme.coverImage) ? (
              <img
                src={activeImage || theme.coverImage}
                alt={theme.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              /* High-End Fallback Stationery Preview */
              <div
                className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative select-none"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #2A040E 100%)`,
                  color: '#FFF9F4',
                }}
              >
                <div
                  className="absolute inset-4 rounded-xl border border-dashed pointer-events-none opacity-40"
                  style={{ borderColor: secondaryColor }}
                />
                <div className="relative z-10 space-y-2">
                  <LotusMotif className="w-12 h-12 mx-auto" style={{ color: secondaryColor }} />
                  <h3 className="font-serif text-2xl font-bold tracking-wide" style={{ color: secondaryColor }}>
                    {theme.name}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-floral-ivory/80">
                    Bespoke Royal Wedding Suite
                  </p>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <Badge variant="maroon" size="sm">
                Authentic Indian Royal Palette
              </Badge>
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {theme.previewImages && theme.previewImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 max-w-full">
              {theme.previewImages.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveImage(imgUrl);
                    setImageError(false);
                  }}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === imgUrl
                      ? 'border-floral-gold shadow-gold-glow scale-105'
                      : 'border-floral-gold/30 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View preview photo ${i + 1}`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Theme Specifications & Actions */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-widest text-floral-gold font-bold">
                Royal Wedding Theme
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-floral-burgundy tracking-wide">
              {theme.name}
            </h1>
            <FloralDivider className="w-36 h-3 text-floral-gold my-3" />
          </div>

          <p className="text-sm text-floral-brown leading-relaxed font-medium">
            {theme.description}
          </p>

          {/* Restored Theme Tags */}
          {theme.tags && theme.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-semibold text-floral-brown/80 mr-1">Tags:</span>
              {theme.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-floral-blush/90 text-floral-burgundy border border-royal-rose/30 hover:border-floral-gold transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Price & Supported Formats Card */}
          <Card ornate={false} className="p-4 bg-floral-blush/60 border border-floral-gold/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-floral-brown block">Starting Price</span>
                <span className="text-[11px] text-floral-gold font-bold uppercase tracking-wider">
                  Category: {theme.category}
                </span>
              </div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-floral-burgundy">
                ₹{theme.priceDisplay}
              </span>
            </div>
            <div className="pt-2 border-t border-floral-gold/20">
              <span className="text-[11px] uppercase tracking-wider text-floral-burgundy font-bold block mb-1.5">
                Supported Formats:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {theme.supportedFormats?.map((fmt, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-white text-floral-burgundy border border-floral-gold/40 px-2.5 py-1 rounded-lg shadow-xs"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Included Features Checklist */}
          {theme.features && theme.features.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-floral-burgundy">
                Included Features & Rituals
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-floral-brown font-medium">
                {theme.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-3">
            <Link to={`/customize/${theme.slug || theme.id}`} className="block">
              <Button variant="gold" size="lg" className="w-full">
                <Sparkles className="w-5 h-5 mr-2" />
                Customize This Theme Now
              </Button>
            </Link>

            <Link to="/invite/priya-and-rohan" className="block">
              <Button variant="outline" size="md" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Full Live Sample Invitation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
