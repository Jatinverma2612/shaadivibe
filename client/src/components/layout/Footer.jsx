import React from 'react';
import { Link } from 'react-router-dom';
import { DiyaMotif, FloralDivider } from '../common/Motifs.jsx';
import { Heart, Mail, MapPin, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-royal-maroon-950 text-[#FFF9F4] pt-16 pb-12 border-t-2 border-[#C9A24A]/50 relative overflow-hidden">
      {/* Subtle floret backdrop pattern */}
      <div className="absolute inset-0 bg-palace-dark opacity-35 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 space-y-4 text-left">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E5C45B] to-[#C9A24A] flex items-center justify-center text-[#260209] font-serif font-bold text-lg shadow-gold-glow shrink-0">
                SV
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-[#FDF3DA]">
                  Shaadi<span className="text-[#FFF9F4]">Vibe</span>
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-[#E5C45B] font-semibold -mt-0.5">
                  Floral Romantic Wedding Stationery
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#FFF9F4]/90 max-w-md leading-relaxed font-normal">
              ShaadiVibe reimagines Indian wedding celebrations by bringing centuries of royal heritage, sacred Vedic
              auspiciousness, and 3D animated envelope reveals into a modern, mobile-first digital experience.
            </p>

            <div className="pt-2 text-xs text-[#FDF3DA] flex items-center gap-2 font-medium">
              <DiyaMotif className="w-5 h-5 text-[#E5C45B] inline shrink-0" />
              <span>Rooted in tradition • Crafted for modern couples</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="text-left space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#FDF3DA] border-b border-[#C9A24A]/30 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/themes" className="text-[#FFF9F4]/85 hover:text-[#FDF3DA] transition-colors inline-block py-0.5">
                  Explore Themes
                </Link>
              </li>
              <li>
                <Link to="/invite/priya-and-rohan" className="text-[#FFF9F4]/85 hover:text-[#FDF3DA] transition-colors inline-block py-0.5">
                  Live Royal Demo
                </Link>
              </li>
              <li>
                <Link to="/customize/theme-1" className="text-[#FFF9F4]/85 hover:text-[#FDF3DA] transition-colors inline-block py-0.5">
                  Customize Invitation
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="text-[#FFF9F4]/85 hover:text-[#FDF3DA] transition-colors inline-block py-0.5">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#faqs" className="text-[#FFF9F4]/85 hover:text-[#FDF3DA] transition-colors inline-block py-0.5">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Concierge & Policies Column */}
          <div className="text-left space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#FDF3DA] border-b border-[#C9A24A]/30 pb-2">
              Concierge & Policies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-[#FFF9F4]/90">
                <Mail className="w-4 h-4 text-[#E5C45B] shrink-0" />
                <span className="font-medium">namaste@shaadivibe.com</span>
              </li>
              <li className="flex items-center gap-2.5 text-[#FFF9F4]/90">
                <MapPin className="w-4 h-4 text-[#E5C45B] shrink-0" />
                <span>Udaipur • New Delhi • Mumbai</span>
              </li>
              <li className="text-[#FFF9F4]/75 text-xs pt-1">
                Auspicious Muhurat & Event Timings
              </li>
              <li className="text-[#FFF9F4]/75 text-xs">
                Privacy & Guest Data Security
              </li>
            </ul>
          </div>
        </div>

        <FloralDivider className="w-48 h-4 text-[#C9A24A]/60 my-6 mx-auto" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFF9F4]/80 pt-6 border-t border-[#C9A24A]/35">
          <p>© {new Date().getFullYear()} ShaadiVibe Platform. All rights reserved.</p>
          <p className="flex items-center gap-1.5 mt-2 sm:mt-0 font-medium">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" /> for auspicious Indian weddings
          </p>
        </div>
      </div>
    </footer>
  );
};
