import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Eye, Flower2, ShoppingBag, Check } from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { LotusMotif, DiyaMotif } from '../../components/common/Motifs.jsx';
import { useCartStore } from '../../store/cartStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';

export const ThemeCard = ({ theme }) => {
  const [imageError, setImageError] = useState(false);
  const themeId = theme.slug || theme.id || theme._id;

  const isInWishlist = useWishlistStore((state) => state.isInWishlist(themeId));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInCart = useCartStore((state) => state.isInCart(themeId));
  const addToCart = useCartStore((state) => state.addItem);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(theme);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart) {
      addToCart(theme);
    }
  };

  // Primary color for fallback styling
  const primaryColor = theme.colorPalette?.primary || '#5C061D';
  const secondaryColor = theme.colorPalette?.secondary || '#C9A24A';

  return (
    <Card
      ornate={false}
      className="p-0 overflow-hidden flex flex-col justify-between group bg-white border border-[#EADCC8] rounded-2xl relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#C9A24A]"
    >
      {/* Cover Media Container with Aspect Ratio 16/10 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF2EB]/70 flex items-center justify-center">
        {!imageError && theme.coverImage ? (
          <img
            src={theme.coverImage}
            alt={theme.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          /* High-End Floral Romantic Fallback Stationery Cover */
          <div
            className="w-full h-full flex flex-col items-center justify-center p-5 text-center relative overflow-hidden select-none"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #2A040E 100%)`,
              color: '#FFF9F4',
            }}
          >
            {/* Delicate gold arch border */}
            <div
              className="absolute inset-2.5 rounded-xl border border-dashed pointer-events-none opacity-40"
              style={{ borderColor: secondaryColor }}
            />
            {/* Center Motif */}
            <div className="relative z-10 space-y-1 my-auto">
              {theme.category === 'Floral' ? (
                <LotusMotif className="w-8 h-8 mx-auto" style={{ color: secondaryColor }} />
              ) : (
                <DiyaMotif className="w-8 h-8 mx-auto" style={{ color: secondaryColor }} />
              )}
              <h4 className="font-serif text-sm sm:text-base font-bold tracking-wide" style={{ color: secondaryColor }}>
                {theme.name}
              </h4>
              <p className="text-[9px] uppercase tracking-widest text-[#FFF9F4]/80 font-sans">
                Royal Wedding Stationery
              </p>
            </div>
          </div>
        )}

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-50 group-hover:opacity-65 transition-opacity pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <Badge variant="gold" size="sm" className="shadow-xs font-semibold uppercase tracking-wider text-[10px]">
            {theme.category}
          </Badge>
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm text-[#72092C] hover:bg-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#B38738] hover:scale-110"
          aria-label={isInWishlist ? `Remove ${theme.name} from wishlist` : `Add ${theme.name} to wishlist`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isInWishlist ? 'fill-rose-600 text-rose-600' : 'text-[#72092C]/80 hover:text-rose-600'
            }`}
          />
        </button>

        {/* Formats Pill on bottom of image */}
        {theme.supportedFormats && theme.supportedFormats.length > 0 && (
          <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex flex-wrap gap-1.5 pointer-events-none">
            {theme.supportedFormats.map((fmt, i) => (
              <span
                key={i}
                className="text-[9px] font-semibold bg-[#2A040E]/85 text-[#FDF3DA] px-2 py-0.5 rounded backdrop-blur-sm border border-[#C9A24A]/30 shadow-xs"
              >
                {fmt}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between text-left space-y-2.5 relative">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#4A0E17] tracking-wide group-hover:text-[#72092C] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug flex items-center">
              {theme.name}
            </h3>
            {theme.priceDisplay > 0 && (
              <span className="text-xs font-bold text-[#72092C] bg-[#FAF2EB] px-2.5 py-0.5 rounded-full whitespace-nowrap border border-[#EADCC8] shadow-xs shrink-0 mt-0.5">
                ₹{theme.priceDisplay}
              </span>
            )}
          </div>

          <p className="text-xs text-[#4A3B32]/80 mt-1 line-clamp-2 leading-relaxed">
            {theme.description}
          </p>

          {/* Theme Tags */}
          {theme.tags && theme.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {theme.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF2EB] text-[#72092C] border border-[#EADCC8]/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ornamental Divider */}
        <div className="w-full flex items-center justify-center my-0.5 pt-0.5 opacity-40">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent flex-1" />
          <Flower2 className="w-3 h-3 text-[#C9A24A] mx-2 shrink-0" />
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent flex-1" />
        </div>

        {/* Action Buttons: Preview, Customize & Add to Cart */}
        <div className="pt-0.5 space-y-2">
          <div className="flex items-center gap-2">
            <Link to={`/themes/${themeId}`} className="flex-1" aria-label={`Preview ${theme.name}`}>
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold py-1.5 hover:border-[#C9A24A] hover:bg-[#FAF2EB]/60">
                <Eye className="w-3.5 h-3.5 mr-1" />
                Preview
              </Button>
            </Link>
            <Link to={`/customize/${themeId}`} className="flex-1" aria-label={`Customize ${theme.name}`}>
              <Button variant="gold" size="sm" className="w-full text-xs font-semibold py-1.5 hover:shadow-md">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Customize
              </Button>
            </Link>
          </div>

          {isInCart ? (
            <Link
              to="/cart"
              className="w-full py-1.5 px-3 rounded-xl border border-emerald-600/40 bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              aria-label={`View ${theme.name} in cart`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>In Cart • View Cart</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-1.5 px-3 rounded-xl bg-[#72092C] hover:bg-[#5C061D] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#72092C] focus:ring-offset-1"
              aria-label={`Add ${theme.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#F5E6CA]" />
              <span>Add to Cart{theme.priceDisplay > 0 ? ` (₹${theme.priceDisplay})` : ''}</span>
            </button>
          )}
        </div>

        {/* Subtle Decorative Corner Motif */}
        <div className="absolute bottom-1 right-1 pointer-events-none opacity-10 text-[#C9A24A]">
          <LotusMotif className="w-8 h-8" />
        </div>
      </div>
    </Card>
  );
};

