import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { DiyaMotif, LotusMotif } from '../common/Motifs.jsx';
import { Button } from '../common/Button.jsx';
import {
  LayoutDashboard,
  Globe,
  FileEdit,
  Sparkles,
  ExternalLink,
  Plus,
  Menu,
  X,
  LogOut,
  User,
  Heart,
  ChevronRight,
} from 'lucide-react';

export const CustomerLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'All Invitations',
      path: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Explore Royal Themes',
      path: '/themes',
      icon: Sparkles,
      external: true,
    },
    {
      name: 'View Sample Wedding',
      path: '/invite/priya-and-rohan',
      icon: ExternalLink,
      external: true,
    },
  ];

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SV';

  return (
    <div className="min-h-screen flex bg-[#FFFDF9] text-floral-brown font-sans antialiased selection:bg-royal-rose-light selection:text-floral-burgundy">
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-floral-gold/30 shadow-sm shrink-0">
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center gap-3 border-b border-floral-gold/20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-floral-burgundy flex items-center justify-center border border-floral-gold shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <DiyaMotif className="w-5 h-5 text-floral-gold" />
            </div>
            <div className="text-left">
              <span className="font-serif text-xl font-bold tracking-wider text-floral-burgundy block leading-none">
                Shaadi<span className="text-floral-gold">Vibe</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-floral-gold font-semibold block mt-1">
                Customer Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Primary Action Button */}
        <div className="p-4">
          <Link to="/customize/theme-1" className="block">
            <Button variant="gold" size="md" className="w-full shadow-gold-glow font-bold text-xs">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create Invitation</span>
            </Button>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 py-2 text-left" aria-label="Customer Navigation">
          <div className="text-[10px] uppercase font-bold tracking-wider text-floral-brown/60 px-3 py-1">
            Studio Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path && !item.external;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-floral-blush text-floral-burgundy font-bold shadow-xs border-l-4 border-floral-burgundy'
                    : 'text-floral-brown hover:text-floral-burgundy hover:bg-floral-blush/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-floral-burgundy' : 'text-floral-gold'}`} />
                  <span>{item.name}</span>
                </div>
                {item.external ? (
                  <ExternalLink className="w-3 h-3 text-floral-brown/40" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-floral-brown/30" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card at Sidebar Footer */}
        <div className="p-4 border-t border-floral-gold/20 bg-floral-blush/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-floral-burgundy text-[#FDF3DA] flex items-center justify-center font-serif font-bold text-xs shadow-xs shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-floral-burgundy truncate">
                  {user?.name || 'Customer Account'}
                </p>
                <p className="text-[10px] text-floral-brown/70 truncate">
                  {user?.email || 'customer@shaadivibe.com'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-floral-brown/70 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-floral-gold/30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-floral-burgundy hover:bg-floral-blush transition-colors"
              aria-label="Open customer menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-left">
              <h1 className="font-serif text-lg sm:text-xl font-bold text-floral-burgundy tracking-wide leading-none">
                Customer Studio
              </h1>
              <span className="text-[10px] text-floral-brown/70 font-sans hidden sm:inline-block">
                Manage invitations, ceremonies & RSVPs
              </span>
            </div>
          </div>

          {/* Right Header Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="hidden sm:inline-flex items-center text-xs font-semibold text-floral-gold hover:text-floral-burgundy transition-colors mr-2">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Public Website
            </Link>

            <Link to="/customize/theme-1">
              <Button variant="gold" size="sm" className="shadow-xs font-bold text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>New Invite</span>
              </Button>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-floral-gold/40 text-xs font-semibold text-floral-burgundy hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#FFFDF9] to-floral-blush/20">
          {children}
        </main>
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85%] bg-white h-full flex flex-col shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-floral-gold/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-floral-burgundy flex items-center justify-center border border-floral-gold text-floral-gold">
                  <DiyaMotif className="w-4 h-4" />
                </div>
                <span className="font-serif text-lg font-bold text-floral-burgundy">
                  Shaadi<span className="text-floral-gold">Vibe</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-floral-brown hover:bg-floral-blush transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action */}
            <div className="p-4 border-b border-floral-gold/20">
              <Link to="/customize/theme-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gold" size="md" className="w-full text-xs font-bold shadow-sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Create New Invitation</span>
                </Button>
              </Link>
            </div>

            {/* Drawer Nav Items */}
            <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto text-left">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path && !item.external;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-floral-blush text-floral-burgundy font-bold border-l-4 border-floral-burgundy'
                        : 'text-floral-brown hover:bg-floral-blush/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-floral-gold" />
                      <span>{item.name}</span>
                    </div>
                    {item.external && <ExternalLink className="w-3 h-3 text-floral-brown/40" />}
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Logout at Drawer Footer */}
            <div className="p-4 border-t border-floral-gold/30 bg-floral-blush/20">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-floral-burgundy text-[#FDF3DA] flex items-center justify-center font-bold text-xs">
                  {userInitials}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-floral-burgundy truncate">
                    {user?.name || 'Customer Account'}
                  </p>
                  <p className="text-[10px] text-floral-brown/70 truncate">
                    {user?.email || 'customer@shaadivibe.com'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-xs border-red-300 text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
