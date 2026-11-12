import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Sparkles,
  Eye,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FloralDivider, LotusMotif, DiyaMotif } from '../../components/common/Motifs.jsx';
import { useCartStore } from '../../store/cartStore.js';

export const CartPage = () => {
  const { items, subtotal, count, isLoading, error, removeItem, clearCart, initCart } =
    useCartStore();

  useEffect(() => {
    initCart();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B38738]">
          Review Your Selection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A0E17] tracking-wide mt-1">
          Wedding Stationery Cart
        </h1>
        <p className="text-xs sm:text-sm text-[#4A3B32]/85 max-w-xl mx-auto mt-2 leading-relaxed">
          Review your selected royal wedding invitation themes. Each license includes our full interactive suite, guest RSVP tracking, and live digital stationery.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-8 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#EADCC8] bg-white p-5 animate-pulse flex gap-4"
              >
                <div className="w-28 sm:w-36 aspect-[16/10] rounded-xl bg-[#FAF2EB]" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-[#FAF2EB] rounded w-1/2" />
                  <div className="h-3 bg-[#FAF2EB]/70 rounded w-1/3" />
                  <div className="h-3 bg-[#FAF2EB]/50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-[#EADCC8] bg-white p-6 animate-pulse h-64" />
          </div>
        </div>
      ) : items.length === 0 ? (
        /* Empty Cart State */
        <div className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-[#EADCC8] rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF2EB] flex items-center justify-center mx-auto mb-4 border border-[#C9A24A]/40 text-[#72092C]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#4A0E17]">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-[#4A3B32]/80 mt-2 leading-relaxed">
            You haven't added any wedding invitation themes to your cart yet. Explore our royal collection and discover the perfect design for your special day.
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
        /* Populated Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADCC8]/80">
              <span className="text-xs font-bold uppercase tracking-wider text-[#72092C]">
                Selected Themes ({count})
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-[#4A3B32]/70 hover:text-red-700 transition-colors flex items-center gap-1"
                aria-label="Clear all items from cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            {items.map((theme) => {
              const themeId = theme.slug || theme.id || theme._id;
              const primaryColor = theme.colorPalette?.primary || '#5C061D';
              const secondaryColor = theme.colorPalette?.secondary || '#C9A24A';

              return (
                <div
                  key={themeId}
                  className="rounded-2xl border border-[#EADCC8] bg-white p-4 sm:p-5 shadow-xs hover:border-[#C9A24A]/70 transition-all flex flex-col sm:flex-row gap-4 sm:gap-5"
                >
                  {/* Theme Thumbnail */}
                  <div className="w-full sm:w-36 md:w-40 aspect-[16/10] rounded-xl overflow-hidden bg-[#FAF2EB] shrink-0 relative flex items-center justify-center">
                    {theme.coverImage ? (
                      <img
                        src={theme.coverImage}
                        alt={theme.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, #2A040E 100%)`,
                          color: '#FFF9F4',
                        }}
                      >
                        <LotusMotif className="w-6 h-6 mx-auto" style={{ color: secondaryColor }} />
                        <span className="font-serif text-xs font-bold mt-1 line-clamp-1" style={{ color: secondaryColor }}>
                          {theme.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Theme Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-base sm:text-lg font-bold text-[#4A0E17]">
                              {theme.name}
                            </h3>
                            <Badge variant="gold" size="sm" className="text-[9px] uppercase tracking-wider">
                              {theme.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#4A3B32]/80 mt-1 line-clamp-2">
                            {theme.description}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="font-serif text-base sm:text-lg font-bold text-[#72092C]">
                            ₹{theme.priceDisplay || 0}
                          </span>
                          <span className="block text-[9px] uppercase tracking-wider text-[#4A3B32]/60">
                            Digital License
                          </span>
                        </div>
                      </div>

                      {/* Format tags */}
                      {theme.supportedFormats && theme.supportedFormats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {theme.supportedFormats.map((fmt, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-medium px-2 py-0.5 rounded bg-[#FAF2EB] text-[#72092C] border border-[#EADCC8]"
                            >
                              {fmt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#EADCC8]/50">
                      <div className="flex items-center gap-2">
                        <Link to={`/themes/${themeId}`}>
                          <Button variant="outline" size="sm" className="text-xs py-1 px-3">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview
                          </Button>
                        </Link>
                        <Link to={`/customize/${themeId}`}>
                          <Button variant="gold" size="sm" className="text-xs py-1 px-3">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Customize
                          </Button>
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(themeId)}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 p-1"
                        aria-label={`Remove ${theme.name} from cart`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[#EADCC8] bg-white p-6 shadow-md space-y-5">
              <h2 className="font-serif text-xl font-bold text-[#4A0E17] pb-3 border-b border-[#EADCC8]">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-[#4A3B32]">
                  <span>Theme Licenses ({count} {count === 1 ? 'theme' : 'themes'})</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[#4A3B32]">
                  <span>Interactive RSVP Suite</span>
                  <span className="text-emerald-700 font-semibold">Included Free</span>
                </div>
                <div className="flex justify-between text-[#4A3B32]">
                  <span>Instant Digital Delivery</span>
                  <span className="text-emerald-700 font-semibold">Instant Access</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EADCC8] flex items-baseline justify-between">
                <div>
                  <span className="font-serif text-base sm:text-lg font-bold text-[#4A0E17]">
                    Total Amount
                  </span>
                  <span className="block text-[10px] text-[#4A3B32]/70">
                    Trusted server-verified pricing
                  </span>
                </div>
                <span className="font-serif text-2xl font-bold text-[#72092C]">
                  ₹{subtotal}
                </span>
              </div>

              {/* Informational Checkout Notice */}
              <div className="p-3.5 rounded-2xl bg-[#FAF2EB] border border-[#EADCC8] text-[11px] text-[#4A3B32]/90 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[#72092C] mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#B38738]" />
                  <span>Interactive Preview & Draft Ready</span>
                </div>
                Payment processing will be available in the upcoming launch. You can freely customize all themes in your cart right now and share digital drafts!
              </div>

              {/* Checkout CTA button (Informational / Coming soon) */}
              <div className="space-y-2">
                <Link to={`/customize/${items[0]?.slug || items[0]?.id || 'theme-1'}`}>
                  <Button
                    variant="burgundy"
                    size="lg"
                    className="w-full text-xs font-semibold py-3 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Customize Your Selected Theme</span>
                    <ArrowRight className="w-4 h-4 text-[#F5E6CA]" />
                  </Button>
                </Link>

                <Link to="/themes">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs py-2 border-[#C9A24A]/40 text-[#72092C] hover:bg-[#FAF2EB]"
                  >
                    Continue Browsing Themes
                  </Button>
                </Link>
              </div>

              {/* Trust & Guarantee */}
              <div className="pt-3 border-t border-[#EADCC8]/60 space-y-2 text-[11px] text-[#4A3B32]/75">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#B38738] shrink-0" />
                  <span>100% Secure Wedding Invitations & Guest Privacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B38738] shrink-0" />
                  <span>Lifetime access to invitation and RSVP responses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
