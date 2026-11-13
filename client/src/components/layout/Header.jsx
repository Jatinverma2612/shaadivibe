import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, Crown, User, LogOut, Heart, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const cartCount = useCartStore((state) => state.count);
  const initCart = useCartStore((state) => state.initCart);
  const wishlistCount = useWishlistStore((state) => state.count);
  const initWishlist = useWishlistStore((state) => state.initWishlist);
  const menuButtonRef = useRef(null);
  const userMenuRef = useRef(null);

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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Keyboard accessibility: Close mobile drawer and user dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (userMenuOpen) setUserMenuOpen(false);
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

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
            className="flex items-center gap-2.5 sm:gap-3 group outline-none focus:outline-none focus-visible:ring-0 select-none p-1"
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

          {/* Desktop Navigation Links — Pure transparent styling without block/pill backgrounds */}
          <nav
            className="hidden md:flex items-center space-x-1 lg:space-x-2"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 focus:outline-none ${
                  isActive(link.path)
                    ? 'text-[#72092C] font-bold'
                    : 'text-[#4A3B32] hover:text-[#72092C]'
                }`}
              >
                <span>{link.name}</span>
                {isActive(link.path) && (
                  <span
                    className="absolute bottom-0 inset-x-2.5 h-[2px] bg-gradient-to-r from-[#B38738] via-[#72092C] to-[#B38738] rounded-full pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
            {/* Wishlist Link with Dynamic Badge */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-full text-[#72092C] hover:text-[#4A0E17] hover:bg-[#FAF2EB]/70 transition-colors outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#B38738]"
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
              className="relative p-2 rounded-full text-[#72092C] hover:text-[#4A0E17] hover:bg-[#FAF2EB]/70 transition-colors outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#B38738]"
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

            {/* User Account Icon & Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="relative p-2 rounded-full text-[#72092C] hover:text-[#4A0E17] hover:bg-[#FAF2EB]/70 transition-colors outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#B38738] flex items-center justify-center"
                  title={`Account: ${user?.name || 'Customer'}`}
                  aria-label="User Account Menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="w-4.5 h-4.5 text-[#72092C]" />
                  <span
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white"
                    title="Signed in"
                  />
                </button>

                {/* Luxury Royal Account Dropdown Popover */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/98 backdrop-blur-md border border-[#EADCC8] shadow-xl p-3 z-50 text-left">
                    {/* User Profile Card */}
                    <div className="px-3 py-2.5 bg-[#FAF2EB]/70 rounded-xl mb-2 border border-[#EADCC8]/60">
                      <p className="text-xs font-bold text-[#4A0E17] truncate">
                        {user?.name || 'Customer Account'}
                      </p>
                      <p className="text-[11px] text-[#4A3B32]/75 truncate">
                        {user?.email || 'customer@shaadivibe.com'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#4A0E17] hover:bg-[#FAF2EB] rounded-lg transition-colors"
                      >
                        <Crown className="w-4 h-4 text-[#B38738]" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#4A3B32] hover:bg-[#FAF2EB] rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-[#72092C]" />
                          <span>Wishlist</span>
                        </span>
                        {wishlistCount > 0 && (
                          <span className="text-[10px] bg-[#FAF2EB] text-[#72092C] font-bold px-1.5 py-0.5 rounded-full border border-[#EADCC8]">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#4A3B32] hover:bg-[#FAF2EB] rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <ShoppingBag className="w-4 h-4 text-[#72092C]" />
                          <span>Cart</span>
                        </span>
                        {cartCount > 0 && (
                          <span className="text-[10px] bg-[#FAF2EB] text-[#72092C] font-bold px-1.5 py-0.5 rounded-full border border-[#EADCC8]">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Sign Out Action inside User Account Details */}
                    <div className="pt-2 mt-2 border-t border-[#EADCC8]/80">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-full text-[#72092C] hover:text-[#4A0E17] hover:bg-[#FAF2EB]/70 transition-colors outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#B38738]"
                title="Sign In / Register"
                aria-label="Account Login or Register"
              >
                <User className="w-4.5 h-4.5 text-[#72092C]" />
              </Link>
            )}

            {/* Create Invite CTA Button */}
            <Link
              to="/customize/theme-1"
              className="px-4 py-1.5 sm:py-2 rounded-full bg-[#72092C] hover:bg-[#5C061D] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#72092C] focus-visible:ring-offset-1 shrink-0 ml-1"
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

            {/* Mobile User Account Icon */}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="relative p-1.5 rounded-full text-[#72092C] hover:bg-[#FAF2EB]"
                aria-label="My Dashboard"
                title={`Account: ${user?.name || 'Customer'}`}
              >
                <User className="w-4 h-4 text-[#72092C]" />
                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="p-1.5 rounded-full text-[#72092C] hover:bg-[#FAF2EB]"
                aria-label="Sign In or Register"
                title="Sign In / Register"
              >
                <User className="w-4 h-4 text-[#72092C]" />
              </Link>
            )}

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
              className="p-1.5 rounded-lg text-[#4A3B32] hover:text-[#72092C] hover:bg-[#FAF2EB] outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#B38738]"
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
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'text-[#72092C] font-bold'
                      : 'text-[#4A3B32] hover:text-[#72092C]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-[#EADCC8]/60 my-1 space-y-1">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-[#72092C] hover:text-[#4A0E17] rounded-lg flex items-center justify-between"
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
                  className="px-3 py-2 text-sm font-semibold text-[#72092C] hover:text-[#4A0E17] rounded-lg flex items-center justify-between"
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

                {/* User Section in Mobile Drawer */}
                {isAuthenticated ? (
                  <div className="pt-2 mt-2 border-t border-[#EADCC8]/60 space-y-1">
                    <div className="px-3 py-2 bg-[#FAF2EB]/70 rounded-xl mb-1 border border-[#EADCC8]/50">
                      <p className="text-xs font-bold text-[#4A0E17] truncate">
                        {user?.name || 'Customer Account'}
                      </p>
                      <p className="text-[11px] text-[#4A3B32]/75 truncate">
                        {user?.email || 'customer@shaadivibe.com'}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-[#72092C] hover:text-[#4A0E17] rounded-lg flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4 text-[#B38738]" />
                      <span>My Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 mt-2 border-t border-[#EADCC8]/60">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-[#72092C] hover:text-[#4A0E17] rounded-lg flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-[#72092C]" />
                      <span>Sign In / Register</span>
                    </Link>
                  </div>
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
