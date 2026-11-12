import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Layers,
  Video,
  Globe,
  Users,
  MailCheck,
  Tag,
  TrendingUp,
  CreditCard,
  FileText,
  LifeBuoy,
  Settings,
  Search,
  Bell,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Heart,
} from 'lucide-react';

export const AdminLayout = ({
  children,
  activeSection,
  onSectionChange,
  adminUser,
  searchKeyword = '',
  onSearchChange,
  ordersCount = 0,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('shaadivibe_admin_token');
    navigate('/admin');
  };

  // 13 Navigation Items exactly matching the reference screenshot in order
  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: ShoppingBag,
      badge: ordersCount > 0 ? String(ordersCount) : null,
    },
    {
      id: 'categories',
      name: 'Categories',
      icon: FolderTree,
    },
    {
      id: 'themes',
      name: 'Themes',
      icon: Layers,
    },
    {
      id: 'video-templates',
      name: 'Video Templates',
      icon: Video,
    },
    {
      id: 'website-templates',
      name: 'Website Templates',
      icon: Globe,
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: Users,
    },
    {
      id: 'rsvp',
      name: 'RSVP Responses',
      icon: MailCheck,
    },
    {
      id: 'coupons',
      name: 'Coupons & Offers',
      icon: Tag,
    },
    {
      id: 'payments',
      name: 'Payments',
      icon: CreditCard,
    },
    {
      id: 'content',
      name: 'Content Management',
      icon: FileText,
    },
    {
      id: 'support',
      name: 'Support Tickets',
      icon: LifeBuoy,
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
    },
  ];

  const adminName = adminUser?.name || 'Admin';
  const adminRole = adminUser?.role === 'admin' ? 'Super Admin' : (adminUser?.role || 'Super Admin');

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] text-gray-900 font-sans antialiased selection:bg-[#8B1D3B] selection:text-white">
      {/* ========================================================
          DESKTOP SIDEBAR (260px)
         ======================================================== */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#1E040D] text-white shrink-0 select-none border-r border-[#380718]">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center border-b border-white/10">
          <Link
            to="/admin/dashboard"
            onClick={(e) => {
              if (onSectionChange) {
                e.preventDefault();
                onSectionChange('dashboard');
              }
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#8B1D3B] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="font-serif text-lg font-bold tracking-wide text-white">
              Shaadi<span className="text-rose-200">Vibe</span>
            </span>
          </Link>
        </div>

        {/* 13 Navigation Items */}
        <nav
          className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
          aria-label="Admin Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onSectionChange) onSectionChange(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#8B1D3B] text-white font-semibold shadow-sm'
                    : 'text-rose-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-white' : 'text-rose-200/60'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FF6B4A] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ========================================================
          MAIN VIEWPORT
         ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                placeholder="Search orders, customers, themes..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B] text-gray-800 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#8B1D3B] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                1
              </span>
            </button>

            {/* Public Live Site Shortcut */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#8B1D3B] transition-colors"
              title="Open public website in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              <span>Live Site</span>
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            {/* Admin User Profile Badge */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#8B1D3B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] text-gray-500 block leading-tight">
                  {adminRole}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FAF8F5]">
          {children}
        </main>
      </div>

      {/* ========================================================
          MOBILE NAVIGATION DRAWER
         ======================================================== */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-72 max-w-[85%] bg-[#1E040D] text-white h-full flex flex-col shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8B1D3B] flex items-center justify-center text-white">
                  <Heart className="w-4 h-4 fill-white text-white" />
                </div>
                <span className="font-serif text-lg font-bold text-white">
                  Shaadi<span className="text-rose-200">Vibe</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (onSectionChange) onSectionChange(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#8B1D3B] text-white font-semibold'
                        : 'text-rose-100/70 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B4A] text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Drawer Logout */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/40 text-xs font-bold text-rose-300 hover:bg-rose-950/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Admin Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
