import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchThemeBySlug } from '../../services/api.js';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import {
  Sparkles,
  Eye,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Check,
  Loader2,
  Heart,
} from 'lucide-react';

export const ThemePreview = () => {
  const { slug } = useParams();
  const [theme, setTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetchThemeBySlug(slug)
      .then((data) => {
        setTheme(data);
        setActiveImage(data.coverImage);
      })
      .catch((err) => {
        setError(err.message || 'Theme not found');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 text-royal-gold-600 animate-spin mb-3" />
        <h3 className="font-serif text-lg font-bold text-royal-maroon-800">
          Loading Theme Preview...
        </h3>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-royal-ivory-card border-2 border-royal-maroon-300 rounded-2xl shadow-royal">
        <Heart className="w-12 h-12 text-royal-maroon-600 mx-auto mb-3 opacity-60" />
        <h2 className="font-serif text-2xl font-bold text-royal-maroon-800">
          Theme Not Found
        </h2>
        <p className="text-xs text-royal-brown-600 mt-2 mb-6">
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumbs */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/themes"
          className="inline-flex items-center text-xs font-semibold text-royal-gold-700 hover:text-royal-maroon-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Theme Gallery</span>
        </Link>

        <Badge variant="gold" size="md">
          {theme.category} Collection
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Visual Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-royal-gold-500/50 shadow-royal-lg bg-royal-ivory-warm">
            <img
              src={activeImage || theme.coverImage}
              alt={theme.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="maroon" size="sm">
                Authentic Indian Royal Palette
              </Badge>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {theme.previewImages && theme.previewImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {theme.previewImages.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === imgUrl
                      ? 'border-royal-gold-600 shadow-gold-glow scale-105'
                      : 'border-royal-gold-300/60 opacity-70 hover:opacity-100'
                  }`}
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-royal-gold-700 font-bold">
                Royal Wedding Theme
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-royal-maroon-800 tracking-wide">
              {theme.name}
            </h1>
            <FloralDivider className="w-36 h-3 text-royal-gold-500 my-3" />
          </div>

          <p className="text-sm text-royal-brown-700 leading-relaxed font-medium">
            {theme.description}
          </p>

          {/* Price & Supported Formats Card */}
          <Card ornate={false} className="p-4 bg-royal-gold-50/60 border border-royal-gold-300 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-royal-brown-600">Starting Price</span>
              <span className="font-serif text-2xl font-bold text-royal-maroon-800">
                ₹{theme.priceDisplay}
              </span>
            </div>
            <div className="pt-2 border-t border-royal-gold-300/40">
              <span className="text-[11px] uppercase tracking-wider text-royal-gold-800 font-bold block mb-1.5">
                Supported Formats:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {theme.supportedFormats?.map((fmt, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-white text-royal-maroon-800 border border-royal-gold-400 px-2.5 py-1 rounded-md"
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
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-royal-maroon-800">
                Included Features & Rituals
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-royal-brown-800 font-medium">
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
          <div className="pt-4 space-y-3">
            <Link to={`/customize/${theme.slug}`} className="block">
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
