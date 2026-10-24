import React from 'react';
import { Link } from 'react-router-dom';
import { DiyaMotif, FloralDivider } from '../common/Motifs.jsx';
import { Heart, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-royal-maroon-950 text-royal-ivory-warm pt-16 pb-12 border-t-2 border-royal-gold-500/40 relative overflow-hidden">
      {/* Subtle gold floret background */}
      <div className="absolute inset-0 bg-palace-dark opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4 text-left">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-royal-gold-500 flex items-center justify-center text-royal-brown-950 font-serif font-bold shadow-gold-glow">
                SV
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-royal-gold-400">
                  Shaadi<span className="text-royal-ivory-DEFAULT">Vibe</span>
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-royal-gold-300">
                  Royal Digital Invitations
                </span>
              </div>
            </Link>
            <p className="text-sm text-royal-ivory-warm/80 max-w-md leading-relaxed">
              ShaadiVibe reimagines Indian wedding celebrations by bringing centuries of royal heritage, sacred Vedic
              auspiciousness, and 3D animated envelope reveals into a modern, mobile-first digital experience.
            </p>
            <div className="pt-2 text-xs text-royal-gold-300 flex items-center gap-2">
              <DiyaMotif className="w-5 h-5 text-royal-gold-400 inline" />
              <span>Rooted in tradition • Crafted for modern couples</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-royal-gold-400">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-royal-ivory-warm/80">
              <li>
                <Link to="/themes" className="hover:text-royal-gold-300 transition-colors">
                  Explore Themes
                </Link>
              </li>
              <li>
                <Link to="/invite/priya-and-rohan" className="hover:text-royal-gold-300 transition-colors">
                  Live Royal Demo
                </Link>
              </li>
              <li>
                <Link to="/customize/theme-1" className="hover:text-royal-gold-300 transition-colors">
                  Customize Invitation
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-royal-gold-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#faqs" className="hover:text-royal-gold-300 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Administration & Legal */}
          <div className="text-left space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-royal-gold-400">
              Platform & Admin
            </h4>
            <ul className="space-y-2 text-sm text-royal-ivory-warm/80">
              <li>
                <Link to="/admin" className="hover:text-royal-gold-300 transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-royal-gold-400" />
                  Admin Portal
                </Link>
              </li>
              <li>
                <span className="text-royal-ivory-warm/60">Terms & Ceremony Policies</span>
              </li>
              <li>
                <span className="text-royal-ivory-warm/60">Privacy & Data Security</span>
              </li>
              <li>
                <span className="text-royal-ivory-warm/60">Support: namaste@shaadivibe.com</span>
              </li>
            </ul>
          </div>
        </div>

        <FloralDivider className="w-48 h-4 text-royal-gold-500/60 my-6 mx-auto" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-royal-ivory-warm/60 pt-4 border-t border-royal-gold-500/20">
          <p>© {new Date().getFullYear()} ShaadiVibe Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" /> for auspicious Indian weddings
          </p>
        </div>
      </div>
    </footer>
  );
};
