import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeManager } from './ThemeManager.jsx';
import { ContentManager } from './ContentManager.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import {
  Shield,
  Layers,
  FileText,
  LogOut,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';

export const AdminDashboard = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('themes');
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    localStorage.removeItem('shaadivibe_admin_token');
    if (onLogout) onLogout();
    navigate('/admin');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="bg-royal-maroon-900 text-royal-ivory-DEFAULT rounded-2xl p-6 sm:p-8 border-2 border-royal-gold-500/50 shadow-royal-lg mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-royal-gold-500 text-royal-brown-950 flex items-center justify-center font-serif font-black shadow-gold-glow">
            SV
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-royal-gold-400" />
              <span className="text-xs uppercase tracking-widest text-royal-gold-300 font-bold">
                Admin Control Center
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-ivory-DEFAULT mt-0.5">
              Welcome, {currentUser?.name || 'Royal Administrator'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/" target="_blank">
            <Button variant="outline" size="sm" className="bg-white/10 text-royal-gold-200 border-royal-gold-400/50 hover:bg-white/20">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Live Site
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogoutClick} className="text-rose-300 hover:text-white hover:bg-rose-900/50">
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card ornate={false} className="p-4 bg-royal-ivory-card border border-royal-gold-400/30 text-left">
          <span className="text-[11px] uppercase tracking-wider text-royal-brown-600 font-semibold block">
            Active Themes
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-royal-maroon-800 mt-1 block">
            6 Royal Suites
          </span>
        </Card>

        <Card ornate={false} className="p-4 bg-royal-ivory-card border border-royal-gold-400/30 text-left">
          <span className="text-[11px] uppercase tracking-wider text-royal-brown-600 font-semibold block">
            Supported Formats
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-royal-gold-700 mt-1 block">
            Interactive + Video
          </span>
        </Card>

        <Card ornate={false} className="p-4 bg-royal-ivory-card border border-royal-gold-400/30 text-left">
          <span className="text-[11px] uppercase tracking-wider text-royal-brown-600 font-semibold block">
            Sample Live Demo
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-royal-maroon-800 mt-1 block">
            Priya & Rohan
          </span>
        </Card>

        <Card ornate={false} className="p-4 bg-royal-ivory-card border border-royal-gold-400/30 text-left">
          <span className="text-[11px] uppercase tracking-wider text-royal-brown-600 font-semibold block">
            Platform Security
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 block">
            JWT Protected
          </span>
        </Card>
      </div>

      {/* Navigation Switcher */}
      <div className="flex border-b border-royal-gold-400/30 mb-8 space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`pb-3 text-sm font-serif font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'themes'
              ? 'border-royal-maroon-700 text-royal-maroon-800'
              : 'border-transparent text-royal-brown-500 hover:text-royal-maroon-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Themes Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`pb-3 text-sm font-serif font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'content'
              ? 'border-royal-maroon-700 text-royal-maroon-800'
              : 'border-transparent text-royal-brown-500 hover:text-royal-maroon-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Homepage CMS Content</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'themes' ? <ThemeManager /> : <ContentManager />}
    </div>
  );
};
