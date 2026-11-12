import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Trash2,
  Sparkles,
  Eye,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FloralDivider, LotusMotif, DiyaMotif } from '../../components/common/Motifs.jsx';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useCartStore } from '../../store/cartStore.js';

export const WishlistPage = () => {
  const { items, count, isLoading, error, removeItem, initWishlist } = useWishlistStore();
  const { isInCart, addItem: addToCart } = useCartStore();

  useEffect(() => {
    initWishlist();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B38738]">
          Saved Wedding Inspirations
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A0E17] tracking-wide mt-1">
          Your Royal Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-[#4A3B32]/85 max-w-xl mx-auto mt-2 leading-relaxed">
          Keep track of your favorite digital invitation designs. Easily compare palettes, customize sample drafts, or add them directly to your cart.
        </p>
        <FloralDivider className="w-40 h-3 text-[#C9A24A] mx-auto mt-3" />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 max-w-6xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
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
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty Wishlist State */
        <div className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-[#EADCC8] rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF2EB] flex items-center justify-center mx-auto mb-4 border border-[#C9A24A]/40 text-[#72092C]">
            <Heart className="w-8 h-8 fill-[#72092C]/10 text-[#72092C]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#4A0E17]">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-[#4A3B32]/80 mt-2 leading-relaxed">
            You haven't saved any wedding invitation themes yet. Tap the heart icon on any design in our gallery to keep it here for later.
          </p>
          <div className="mt-6">
            <Link to="/themes">
              <Button variant="burgundy" size="md" className="text-xs px-6 py-2.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#F5E6CA]" />
                Explore Royal Themes
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Populated Wishlist Grid */
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#EADCC8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#72092C]">
              Saved Designs ({count})
            </span>
            <Link
              to="/themes"
              className="text-xs text-[#72092C] hover:text-[#5C061D] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Browse More Themes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {items.map((theme) => {
              const themeId = theme.slug || theme.id || theme._id;
              const inCart = isInCart(themeId);
              const primaryColor = theme.colorPalette?.primary || '#5C061D';
              const secondaryColor = theme.colorPalette?.secondary || '#C9A24A';

              return (
                <div
                  key={themeId}
                  className="rounded-2xl border border-[#EADCC8] bg-white overflow-hidden shadow-xs hover:border-[#C9A24A] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF2EB] flex items-center justify-center">
                    {theme.coverImage ? (
                      <img
                        src={theme.coverImage}
                        alt={theme.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, #2A040E 100%)`,
                          color: '#FFF9F4',
                        }}
                      >
                        <LotusMotif className="w-8 h-8 mx-auto" style={{ color: secondaryColor }} />
                        <h4 className="font-serif text-sm font-bold mt-1" style={{ color: secondaryColor }}>
                          {theme.name}
                        </h4>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <Badge variant="gold" size="sm" className="text-[9px] uppercase tracking-wider">
                        {theme.category}
                      </Badge>
                    </div>

                    {/* Remove from Wishlist button */}
                    <button
                      type="button"
                      onClick={() => removeItem(themeId)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/95 backdrop-blur-sm text-red-600 hover:bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Remove from wishlist"
                      aria-label={`Remove ${theme.name} from wishlist`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body & Actions */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#4A0E17]">
                          {theme.name}
                        </h3>
                        {theme.priceDisplay > 0 && (
                          <span className="text-xs font-bold text-[#72092C] bg-[#FAF2EB] px-2.5 py-0.5 rounded-full border border-[#EADCC8] whitespace-nowrap">
                            ₹{theme.priceDisplay}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#4A3B32]/80 mt-1 line-clamp-2">
                        {theme.description}
                      </p>
                    </div>

                    <div className="pt-2 space-y-2 border-t border-[#EADCC8]/60">
                      <div className="flex items-center gap-2">
                        <Link to={`/themes/${themeId}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs py-1.5">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview
                          </Button>
                        </Link>
                        <Link to={`/customize/${themeId}`} className="flex-1">
                          <Button variant="gold" size="sm" className="w-full text-xs py-1.5">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Customize
                          </Button>
                        </Link>
                      </div>

                      {inCart ? (
                        <Link
                          to="/cart"
                          className="w-full py-1.5 px-3 rounded-xl border border-emerald-600/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>In Cart • View Cart</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(theme)}
                          className="w-full py-1.5 px-3 rounded-xl bg-[#72092C] hover:bg-[#5C061D] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow focus:outline-none focus:ring-2 focus:ring-[#72092C]"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#F5E6CA]" />
                          <span>Add to Cart{theme.priceDisplay > 0 ? ` (₹${theme.priceDisplay})` : ''}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
