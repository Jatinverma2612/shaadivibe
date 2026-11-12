import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Crown, User, LogOut, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { DiyaMotif } from '../common/Motifs.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const cartCount = useCartStore((state) => state.count);
  const initCart = useCartStore((state) => state.initCart);
  const wishlistCount = useWishlistStore((state) => state.count);
  const initWishlist = useWishlistStore((state) => state.initWishlist);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    initAuth();
    initCart();
    initWishlist();
  }, []);

  // Optimized lightweight scroll listener with requestAnimationFrame throttle
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 50;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Keyboard accessibility: Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Themes', path: '/themes' },
    { name: 'Live Sample', path: '/invite/priya-and-rohan' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Features', path: '/#features' },
    { name: 'FAQs', path: '/#faqs' },
  ];

  const isActive = (path) => {
    if (path.startsWith('/#')) return false;
    return location.pathname === path;
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-transparent border-transparent pointer-events-none pt-2 sm:pt-3 pb-2 px-3 sm:px-6 lg:px-8'
            : 'bg-white/95 backdrop-blur-md border-b border-[#EADCC8]/80 shadow-xs'
        }`}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${
            isScrolled
              ? 'pointer-events-auto max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 rounded-full bg-[#FFFDF9]/92 backdrop-blur-md border border-[#EADCC8]/90 shadow-lg flex items-center justify-between'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between rounded-none'
          }`}
        >
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-[#B38738] rounded-lg p-1"
          aria-label="ShaadiVibe Home"
        >
          <div
            className={`rounded-full bg-[#72092C] flex items-center justify-center border border-[#D4AF37] shadow-md group-hover:scale-105 transition-all duration-300 shrink-0 ${
              isScrolled ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-10 h-10'
            }`}
          >
            <Crown
              className={`text-[#F5E6CA] transition-all duration-300 ${
                isScrolled ? 'w-4 h-4 sm:w-4.5 sm:h-4.5' : 'w-5 h-5'
              }`}
            />
          </div>
          <div className="text-left">
            <span
              className={`font-serif font-bold tracking-wider text-[#4A0E17] group-hover:text-[#72092C] transition-colors leading-none block ${
                isScrolled ? 'text-lg sm:text-xl' : 'text-2xl'
              }`}
            >
              Shaadi<span className="text-[#B38738]">Vibe</span>
            </span>
            <span
              className={`text-[8px] sm:text-[9px] uppercase tracking-widest text-[#B38738] font-bold transition-all duration-300 ${
                isScrolled ? 'hidden sm:block -mt-0.5' : 'block -mt-0.5'
              }`}
            >
              Royal Digital Invitations
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center space-x-1 lg:space-x-2"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-2.5 lg:px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#B38738] ${
                isActive(link.path)
                  ? 'text-[#72092C] bg-[#FAF2EB] font-bold shadow-xs'
                  : 'text-[#4A3B32] hover:text-[#72092C] hover:bg-[#FAF2EB]/70'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
          {/* Wishlist Link with Dynamic Badge */}
          <Link
            to="/wishlist"
            className="relative p-2 rounded-full text-[#72092C] hover:bg-[#FAF2EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B38738]"
            title={`Wishlist (${wishlistCount} items)`}
            aria-label={`Wishlist (${wishlistCount} items)`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlistCount > 0 ? 'fill-[#72092C] text-[#72092C]' : 'text-[#72092C]'
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#72092C] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link with Dynamic Badge */}
          <Link
            to="/cart"
            className="relative p-2 rounded-full text-[#72092C] hover:bg-[#FAF2EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B38738]"
            title={`Shopping Cart (${cartCount} items)`}
            aria-label={`Shopping Cart (${cartCount} items)`}
          >
            <ShoppingBag className="w-4 h-4 text-[#72092C]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#72092C] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Dashboard / Sign In */}
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-3 sm:px-3.5 py-1.5 rounded-full border border-[#E6CCA4] bg-[#FDF8EE] hover:bg-[#F8EEDC] text-[#72092C] font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#B38738]"
                aria-label="My Dashboard"
              >
                <Crown className="w-3.5 h-3.5 text-[#B38738]" />
                <span className="hidden lg:inline">My Dashboard</span>
              </Link>

              <button
                onClick={logout}
                className="text-[#4A3B32] hover:text-red-700 hover:bg-red-50 text-xs p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="px-3 sm:px-3.5 py-1.5 rounded-full border border-[#E6CCA4] bg-[#FDF8EE] hover:bg-[#F8EEDC] text-[#72092C] font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#B38738]"
              aria-label="My Dashboard"
            >
              <Crown className="w-3.5 h-3.5 text-[#B38738]" />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>
          )}

          {/* Create Invite CTA Button */}
          <Link
            to="/customize/theme-1"
            className="px-4 py-1.5 sm:py-2 rounded-full bg-[#72092C] hover:bg-[#5C061D] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#72092C] focus:ring-offset-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F5E6CA]" />
            <span>Create Invite</span>
          </Link>
        </div>

        {/* Mobile Navigation Icons & Hamburger Button */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Mobile Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-1.5 rounded-full text-[#72092C] hover:bg-[#FAF2EB]"
            aria-label={`Wishlist (${wishlistCount} items)`}
          >
            <Heart
              className={`w-4 h-4 ${
                wishlistCount > 0 ? 'fill-[#72092C] text-[#72092C]' : 'text-[#72092C]'
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#72092C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Mobile Cart */}
          <Link
            to="/cart"
            className="relative p-1.5 rounded-full text-[#72092C] hover:bg-[#FAF2EB]"
            aria-label={`Cart (${cartCount} items)`}
          >
            <ShoppingBag className="w-4 h-4 text-[#72092C]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#72092C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Create Button */}
          <Link
            to="/customize/theme-1"
            className="px-2.5 py-1 rounded-full bg-[#72092C] text-white font-semibold text-[11px] shadow-xs"
          >
            Create
          </Link>

          {/* Menu Hamburger Toggle Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-[#4A3B32] hover:text-[#72092C] hover:bg-[#FAF2EB] focus:outline-none focus:ring-2 focus:ring-[#B38738]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Floating/Dropdown Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className={`pointer-events-auto md:hidden transition-all duration-200 ${
            isScrolled
              ? 'max-w-md mx-auto mt-2 rounded-2xl bg-[#FFFDF9]/98 backdrop-blur-md border border-[#EADCC8] shadow-xl p-4'
              : 'bg-[#FFFDF9] border-b border-[#EADCC8]/80 px-4 pt-3 pb-6 shadow-lg'
          }`}
        >
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'text-[#72092C] bg-[#FAF2EB] font-bold'
                    : 'text-[#4A3B32] hover:text-[#72092C] hover:bg-[#FAF2EB]/60'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-2 border-t border-[#EADCC8]/60 my-1 space-y-1">
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-[#72092C] hover:bg-[#FAF2EB] rounded-lg flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#72092C]" />
                  Wishlist
                </span>
                {wishlistCount > 0 && (
                  <span className="bg-[#72092C] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-[#72092C] hover:bg-[#FAF2EB] rounded-lg flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#72092C]" />
                  Shopping Cart
                </span>
                {cartCount > 0 && (
                  <span className="bg-[#72092C] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-[#72092C] hover:bg-[#FAF2EB] rounded-lg flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-[#B38738]" />
                    My Dashboard {user?.name ? `(${user.name})` : ''}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#4A3B32] hover:text-[#72092C] hover:bg-[#FAF2EB] rounded-lg flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    {/* Fixed-height companion spacer to maintain document layout flow and prevent content jumps */}
    <div className="h-20 w-full pointer-events-none" aria-hidden="true" />
  </>
  );
};


