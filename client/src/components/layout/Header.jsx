import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Shield, Crown, User, LogOut, Heart } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { DiyaMotif } from '../common/Motifs.jsx';
import { useAuthStore } from '../../store/authStore.js';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

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
    <header className="sticky top-0 z-40 bg-royal-ivory-card/90 backdrop-blur-md border-b border-royal-gold-500/20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-royal-maroon-700 flex items-center justify-center border border-royal-gold-400 shadow-royal group-hover:scale-105 transition-transform duration-300">
              <DiyaMotif className="w-6 h-6 text-royal-gold-400" />
            </div>
            <div className="text-left">
              <span className="font-serif text-2xl font-bold tracking-wider text-royal-maroon-800 group-hover:text-royal-maroon-600 transition-colors">
                Shaadi<span className="text-royal-gold-600">Vibe</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-royal-gold-700 font-semibold -mt-1">
                Royal Digital Invitations
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-royal-maroon-700 bg-royal-gold-100/70 border border-royal-gold-300'
                    : 'text-royal-brown-700 hover:text-royal-maroon-700 hover:bg-royal-gold-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-royal-gold-400 text-royal-maroon-800 hover:bg-royal-gold-100/60"
                  >
                    <Crown className="w-3.5 h-3.5 mr-1.5 text-royal-gold-600" />
                    <span>My Dashboard</span>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-royal-brown-600 hover:text-red-700 hover:bg-red-50 text-xs px-2.5"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-royal-brown-700 hover:text-royal-maroon-800 text-xs">
                  <User className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                  Sign In
                </Button>
              </Link>
            )}

            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-royal-brown-500 hover:text-royal-maroon-700 text-xs px-2">
                <Shield className="w-3.5 h-3.5 mr-1 opacity-60" />
                Admin
              </Button>
            </Link>

            <Link to="/customize/theme-1">
              <Button variant="gold" size="md">
                <Sparkles className="w-4 h-4 mr-1.5 text-royal-brown-900" />
                Create Invite
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/customize/theme-1">
              <Button variant="gold" size="sm" className="text-xs">
                Create
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-royal-brown-700 hover:text-royal-maroon-700 hover:bg-royal-gold-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-royal-ivory-card border-b border-royal-gold-500/30 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-royal-brown-800 hover:text-royal-maroon-700 hover:bg-royal-gold-50 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-royal-maroon-800 hover:bg-royal-gold-50 rounded-lg flex items-center gap-2"
                >
                  <Crown className="w-4 h-4 text-royal-gold-600" />
                  My Dashboard ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-royal-brown-800 hover:text-royal-maroon-700 hover:bg-royal-gold-50 rounded-lg flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Sign In / Register
              </Link>
            )}

            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-royal-brown-600 hover:text-royal-maroon-700 hover:bg-royal-gold-50 rounded-lg flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
