import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ArrowRight, Play, Users, Zap, ShieldCheck, MapPin, ChevronDown } from 'lucide-react';

export const HeroSection = ({ content }) => {
  const headlinePart1 = 'Beautiful';
  const headlinePart2 = 'Wedding Invitations';
  const headlinePart3 = 'for Your Special Day';

  const subheadline =
    content?.subheadline ||
    'Create stunning animated wedding invitations and interactive wedding websites in minutes. One-time purchase. No subscriptions.';

  return (
    <section className="relative overflow-hidden bg-cover bg-bottom md:bg-[center_bottom] bg-no-repeat min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center py-10 sm:py-16 lg:py-20"
      style={{ backgroundImage: `url('/shaadivibe-floral-hero.png')` }}
      aria-label="ShaadiVibe Hero Showcase"
    >
      {/* Subtle ivory overlay on left to ensure high text contrast while preserving the palace terrace and florals */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-floral-ivory/85 via-floral-ivory/45 to-transparent pointer-events-none"
        aria-hidden="true" 
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subtitle, Actions, & Stats */}
          <div className="lg:col-span-6 text-left space-y-5 sm:space-y-6 max-w-xl">
            {/* Eyebrow Label */}
            <div className="flex items-center gap-2 text-[#72092C]">
              <span className="text-xs select-none">✦</span>
              <span className="font-serif text-xs sm:text-[13px] tracking-[0.24em] uppercase font-bold text-[#72092C]">
                Digital Wedding Invitations
              </span>
              <span className="text-xs select-none">✦</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[52px] xl:text-[58px] font-bold text-[#4A0E17] tracking-tight leading-[1.12]">
              <span className="block">{headlinePart1}</span>
              <span className="block">{headlinePart2}</span>
              <span className="block text-[#B38738] font-normal italic font-serif">
                {headlinePart3}
              </span>
            </h1>

            {/* Subtle Royal Divider */}
            <div className="flex items-center gap-2 w-32 py-0.5" aria-hidden="true">
              <span className="h-[1px] bg-gradient-to-r from-transparent via-[#C59B27] to-[#C59B27] flex-1" />
              <span className="text-[#C59B27] text-xs">❖</span>
              <span className="h-[1px] bg-gradient-to-r from-[#C59B27] via-[#C59B27] to-transparent flex-1" />
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-[17px] text-[#4A3B32] leading-relaxed font-normal max-w-lg">
              {subheadline}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
              <Link 
                to="/themes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#72092C] hover:bg-[#5C061D] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#72092C] focus:ring-offset-2"
                aria-label="Browse Royal Wedding Themes"
              >
                <Crown className="w-4 h-4 text-[#F5E6CA] shrink-0" />
                <span>Browse Themes</span>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link 
                to="/invite/priya-and-rohan"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white/90 hover:bg-white text-[#72092C] border border-[#D9C4A9] font-semibold text-sm sm:text-base shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#72092C] focus:ring-offset-2"
                aria-label="Experience Live Demo"
              >
                <span className="w-6 h-6 rounded-full bg-[#72092C] text-white flex items-center justify-center pl-0.5 shrink-0 shadow-sm">
                  <Play className="w-3 h-3 fill-white text-white" />
                </span>
                <span>Watch Demo</span>
              </Link>
            </div>

            {/* Row of 4 Feature / Statistic Badges */}
            <div className="pt-4 sm:pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 max-w-lg">
              {/* Stat 1 */}
              <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm p-2 rounded-xl border border-[#F2D7D0]/60 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#FDF0ED] border border-[#F2D7D0] flex items-center justify-center shrink-0 text-[#72092C]">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17] block">
                    1000+
                  </span>
                  <span className="text-[10px] text-[#6B554E] block font-medium">
                    Happy Couples
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm p-2 rounded-xl border border-[#F2D7D0]/60 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#FDF0ED] border border-[#F2D7D0] flex items-center justify-center shrink-0 text-[#72092C]">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17] block">
                    Instant
                  </span>
                  <span className="text-[10px] text-[#6B554E] block font-medium">
                    Delivery
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm p-2 rounded-xl border border-[#F2D7D0]/60 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#FDF0ED] border border-[#F2D7D0] flex items-center justify-center shrink-0 text-[#72092C]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17] block">
                    One-time
                  </span>
                  <span className="text-[10px] text-[#6B554E] block font-medium">
                    Purchase
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm p-2 rounded-xl border border-[#F2D7D0]/60 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#FDF0ED] border border-[#F2D7D0] flex items-center justify-center shrink-0 text-[#72092C]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17] block">
                    Made in
                  </span>
                  <span className="text-[10px] text-[#6B554E] block font-medium">
                    India
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Laptop and Smartphone Mockup on Marble Terrace */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end w-full pt-4 lg:pt-0">
            <div className="relative w-full max-w-[480px] sm:max-w-[530px] lg:max-w-[560px]">
              
              {/* LAPTOP MOCKUP */}
              <div className="relative w-full">
                {/* Display Screen Unit */}
                <div className="bg-[#1C1C1F] p-2 sm:p-2.5 rounded-t-[14px] sm:rounded-t-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-neutral-700/60 relative">
                  
                  {/* Webcam Assembly */}
                  <div className="flex items-center justify-center gap-1.5 absolute top-1 sm:top-1.5 left-1/2 -translate-x-1/2 z-30" aria-hidden="true">
                    <div className="w-1 h-1 bg-neutral-900 rounded-full border border-neutral-800" />
                    <div className="w-1.5 h-1.5 bg-[#0D0D12] rounded-full border border-neutral-700 flex items-center justify-center">
                      <div className="w-0.5 h-0.5 bg-blue-900/60 rounded-full" />
                    </div>
                  </div>

                  {/* Inner Screen Display (16:10 aspect ratio) */}
                  <div className="aspect-[16/10] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5ECE0] rounded-[4px] sm:rounded-[6px] overflow-hidden relative shadow-inner border border-[#C59B27]/30 flex flex-col justify-between">
                    
                    {/* Specular glass reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.12] pointer-events-none z-30" aria-hidden="true" />

                    {/* Decorative Floral Arch Header across top of screen */}
                    <div className="absolute top-0 inset-x-0 h-10 sm:h-14 pointer-events-none z-20 overflow-hidden" aria-hidden="true">
                      <svg viewBox="0 0 500 70" preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                          <linearGradient id="laptopGoldArch" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C59B27" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#E5C158" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#C59B27" stopOpacity="0.4" />
                          </linearGradient>
                          <radialGradient id="roseGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FAD2D8" />
                            <stop offset="60%" stopColor="#E58D98" />
                            <stop offset="100%" stopColor="#C25A69" />
                          </radialGradient>
                        </defs>
                        
                        {/* Subtle Arch Guidelines */}
                        <path d="M 0,15 Q 250,-10 500,15" fill="none" stroke="url(#laptopGoldArch)" strokeWidth="1.5" />
                        <path d="M 30,22 Q 250,2 470,22" fill="none" stroke="url(#laptopGoldArch)" strokeWidth="0.8" strokeDasharray="3,3" />

                        {/* Left Floral Corner Cluster */}
                        <g transform="translate(10, -5)">
                          <ellipse cx="25" cy="22" rx="14" ry="12" fill="url(#roseGrad)" opacity="0.9" />
                          <circle cx="15" cy="16" r="9" fill="#F4BAC2" opacity="0.95" />
                          <circle cx="36" cy="18" r="8" fill="#FFF9F5" opacity="0.95" />
                          <ellipse cx="12" cy="30" rx="8" ry="4" fill="#8A9D87" transform="rotate(-25 12 30)" />
                          <ellipse cx="38" cy="28" rx="9" ry="4" fill="#758872" transform="rotate(30 38 28)" />
                          <circle cx="48" cy="22" r="3" fill="#D4AF37" opacity="0.8" />
                          <circle cx="56" cy="26" r="2.5" fill="#FFFBF5" />
                        </g>

                        {/* Center Arch Garland Swags */}
                        <g transform="translate(200, -8)">
                          <ellipse cx="50" cy="18" rx="12" ry="10" fill="url(#roseGrad)" opacity="0.9" />
                          <circle cx="36" cy="14" r="7" fill="#FFFBF5" />
                          <circle cx="64" cy="14" r="7" fill="#F4BAC2" />
                          <ellipse cx="24" cy="16" rx="7" ry="3.5" fill="#8A9D87" transform="rotate(-20 24 16)" />
                          <ellipse cx="76" cy="16" rx="7" ry="3.5" fill="#758872" transform="rotate(20 76 16)" />
                        </g>

                        {/* Right Floral Corner Cluster */}
                        <g transform="translate(430, -5)">
                          <ellipse cx="25" cy="22" rx="14" ry="12" fill="url(#roseGrad)" opacity="0.9" />
                          <circle cx="35" cy="16" r="9" fill="#F4BAC2" opacity="0.95" />
                          <circle cx="14" cy="18" r="8" fill="#FFF9F5" opacity="0.95" />
                          <ellipse cx="38" cy="30" rx="8" ry="4" fill="#8A9D87" transform="rotate(25 38 30)" />
                          <ellipse cx="12" cy="28" rx="9" ry="4" fill="#758872" transform="rotate(-30 12 28)" />
                          <circle cx="2" cy="22" r="3" fill="#D4AF37" opacity="0.8" />
                          <circle cx="-6" cy="26" r="2.5" fill="#FFFBF5" />
                        </g>
                      </svg>
                    </div>

                    {/* Main Wedding Invitation Screen Content */}
                    <div className="relative z-10 flex items-center justify-between h-full px-3 sm:px-6 pt-5 sm:pt-6 pb-2">
                      
                      {/* Left Invitation Text */}
                      <div className="w-[52%] text-center space-y-1 sm:space-y-1.5 pr-2">
                        
                        {/* Royal Crest / Monogram */}
                        <div className="w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-full bg-gradient-to-b from-[#FFF7ED] to-[#FAF0E4] border border-[#C59B27]/80 flex items-center justify-center shadow-xs">
                          <span className="text-[#B38738] text-[11px] sm:text-sm select-none" aria-hidden="true">❖</span>
                        </div>

                        <p className="text-[7px] sm:text-[9px] font-semibold tracking-[0.22em] text-[#916B54] uppercase">
                          The Wedding Celebration Of
                        </p>

                        <div>
                          <p className="font-serif text-lg sm:text-2xl lg:text-[26px] font-bold text-[#4A0E17] leading-none tracking-tight">
                            Rahul
                          </p>
                          <p className="font-serif italic text-xs sm:text-sm text-[#C59B27] my-0.5">
                            &amp;
                          </p>
                          <p className="font-serif text-lg sm:text-2xl lg:text-[26px] font-bold text-[#4A0E17] leading-none tracking-tight">
                            Priya
                          </p>
                        </div>

                        {/* Gold Ornamental Divider */}
                        <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[#C59B27] text-[9px] sm:text-[10px]" aria-hidden="true">
                          <span className="w-5 sm:w-8 h-[1px] bg-[#C59B27]/50" />
                          <span>❦</span>
                          <span className="w-5 sm:w-8 h-[1px] bg-[#C59B27]/50" />
                        </div>

                        <div className="space-y-0.5 pt-0.5">
                          <p className="text-[8px] sm:text-[10px] font-bold text-[#72092C] uppercase tracking-[0.24em]">
                            12 • DEC • 2025
                          </p>
                          <p className="text-[6.5px] sm:text-[8px] text-[#8C6D46] uppercase tracking-[0.16em] font-medium">
                            The Oberoi Udaivilas • Udaipur
                          </p>
                        </div>
                      </div>

                      {/* Right Couple Photo Frame (Jharokha Scalloped Arch) */}
                      <div className="w-[48%] flex justify-center items-center h-full pl-1">
                        <div className="relative w-32 sm:w-44 h-36 sm:h-48 rounded-t-full rounded-b-xl overflow-hidden shadow-[0_8px_20px_rgba(74,14,23,0.18)] border-2 border-[#D4AF37]/70 bg-[#F5ECE0] ring-1 ring-[#D4AF37]/30">
                          <img 
                            src="/hero-couple-portrait.jpg" 
                            alt="Rahul and Priya in royal wedding attire" 
                            className="w-full h-full object-cover object-[50%_12%]"
                            loading="eager"
                          />
                          {/* Subtle warm base gradient to blend seamlessly into frame */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#4A0E17]/20 via-transparent to-transparent pointer-events-none" />
                        </div>
                      </div>

                    </div>

                    {/* Bottom Navigation Strip on Invitation Website */}
                    <div className="relative z-10 bg-[#FFFDF9]/95 backdrop-blur-xs border-t border-[#D4AF37]/25 py-1 px-3 text-center">
                      <p className="text-[6.5px] sm:text-[8.5px] font-medium tracking-wider text-[#5A3E36] select-none">
                        Our Story &nbsp;•&nbsp; Events &amp; Muhurat &nbsp;•&nbsp; Gallery &nbsp;•&nbsp; Venue &nbsp;•&nbsp; RSVP
                      </p>
                    </div>

                  </div>
                </div>

                {/* Laptop Hinge Connecting Screen to Base */}
                <div 
                  className="w-full h-1 sm:h-1.5 bg-[#121214] border-t border-black/80 relative z-10 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="w-24 sm:w-32 h-[1px] bg-neutral-700/50" />
                </div>

                {/* Laptop Keyboard Deck / Lower Chassis (Metallic Silver Aluminum) */}
                <div 
                  className="w-[105%] -ml-[2.5%] h-5 sm:h-6 bg-gradient-to-b from-[#ECECEF] via-[#DFDFE3] to-[#B0B0B8] rounded-b-xl shadow-xl border-t border-white/60 relative flex flex-col justify-between px-4 pt-0.5 pb-1"
                  aria-hidden="true"
                >
                  {/* Recessed Keyboard Well with Chiclet Keys Simulation */}
                  <div className="w-[84%] mx-auto h-2 sm:h-2.5 bg-[#18181B] rounded-[2px] border border-neutral-600/40 shadow-inner flex flex-col justify-center gap-[1px] px-1 py-[1px] opacity-85">
                    <div className="flex justify-between gap-[1px] h-[1px] sm:h-[1.5px] w-full">
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                    </div>
                    <div className="flex justify-between gap-[1px] h-[1px] sm:h-[1.5px] w-full">
                      <span className="w-3 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-2 bg-[#27272A] rounded-[0.5px]" />
                      <span className="flex-1 bg-[#27272A] rounded-[0.5px]" />
                      <span className="w-3 bg-[#27272A] rounded-[0.5px]" />
                    </div>
                  </div>

                  {/* Centered Glass Trackpad Recess */}
                  <div className="w-14 sm:w-18 h-1 sm:h-1.5 mx-auto rounded-[2px] border border-neutral-400/50 bg-[#E8E8EC]/75 shadow-xs" />

                  {/* Precision CNC Thumb Opening Notch */}
                  <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-neutral-400/80 rounded-b-sm mx-auto -mb-0.5" />
                </div>

                {/* Soft Grounded Shadows on Marble Terrace */}
                <div 
                  className="w-[102%] -ml-[1%] h-2.5 bg-black/45 blur-[3px] rounded-full mx-auto -mt-0.5 pointer-events-none" 
                  aria-hidden="true"
                />
                <div 
                  className="w-[108%] -ml-[4%] h-5 bg-black/25 blur-md rounded-full mx-auto -mt-1.5 pointer-events-none" 
                  aria-hidden="true"
                />
              </div>

              {/* SMARTPHONE MOCKUP (Overlapping front-right of the laptop deck) */}
              <div 
                className="absolute right-0 sm:-right-3 lg:-right-2 bottom-[-10px] sm:bottom-[-16px] w-[130px] sm:w-[158px] lg:w-[174px] z-20"
                aria-label="Mobile Wedding Invitation Preview"
              >
                {/* Dark Titanium Phone Body with Specular Highlight and Depth Shadow */}
                <div className="p-1.5 sm:p-2 bg-[#1C1C1F] border-[2px] sm:border-[2.5px] border-[#3F3F46] rounded-[28px] sm:rounded-[36px] shadow-[-12px_18px_36px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.3)] ring-1 ring-white/10 ring-inset relative">
                  
                  {/* Dynamic Island / Speaker Pill */}
                  <div 
                    className="w-10 sm:w-13 h-2.5 sm:h-3 bg-[#09090B] rounded-full mx-auto absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-30 border border-neutral-800 flex items-center justify-end pr-1.5" 
                    aria-hidden="true" 
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#161622] border border-neutral-700/60" />
                  </div>

                  {/* Mobile Screen (9:19.5 aspect ratio) */}
                  <div className="aspect-[9/19.5] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5ECE0] rounded-[22px] sm:rounded-[28px] overflow-hidden flex flex-col justify-between items-center text-center p-2 sm:p-2.5 relative shadow-inner border border-[#C59B27]/30">
                    
                    {/* Mobile Specular Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] pointer-events-none z-20" aria-hidden="true" />

                    {/* Decorative Floral Arch on Mobile */}
                    <div className="absolute top-0 inset-x-0 h-8 sm:h-10 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
                      <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                          <linearGradient id="mobileGoldArch" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C59B27" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#E5C158" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#C59B27" stopOpacity="0.4" />
                          </linearGradient>
                          <radialGradient id="mobileRose" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FAD2D8" />
                            <stop offset="60%" stopColor="#E58D98" />
                            <stop offset="100%" stopColor="#C25A69" />
                          </radialGradient>
                        </defs>
                        <path d="M 0,10 Q 100,-8 200,10" fill="none" stroke="url(#mobileGoldArch)" strokeWidth="1" />
                        <g transform="translate(10, -4)">
                          <ellipse cx="14" cy="14" rx="8" ry="7" fill="url(#mobileRose)" opacity="0.9" />
                          <circle cx="8" cy="10" r="5" fill="#FFFBF5" />
                          <ellipse cx="6" cy="18" rx="5" ry="2.5" fill="#8A9D87" transform="rotate(-20 6 18)" />
                        </g>
                        <g transform="translate(165, -4)">
                          <ellipse cx="14" cy="14" rx="8" ry="7" fill="url(#mobileRose)" opacity="0.9" />
                          <circle cx="20" cy="10" r="5" fill="#FFFBF5" />
                          <ellipse cx="22" cy="18" rx="5" ry="2.5" fill="#758872" transform="rotate(20 22 18)" />
                        </g>
                      </svg>
                    </div>

                    {/* Top: Couple Portrait in Arch Frame */}
                    <div className="relative z-10 pt-2.5 sm:pt-3.5 w-full flex justify-center">
                      <div className="w-16 sm:w-20 h-20 sm:h-24 rounded-t-full rounded-b-md overflow-hidden border border-[#D4AF37]/70 shadow-sm bg-[#F5ECE0] relative ring-1 ring-[#D4AF37]/30">
                        <img 
                          src="/hero-couple-portrait.jpg" 
                          alt="Rahul and Priya mobile view" 
                          className="w-full h-full object-cover object-[50%_12%]"
                          loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#4A0E17]/20 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* Center: Monogram & Couple Name */}
                    <div className="relative z-10 space-y-0.5 my-auto">
                      <div className="w-4 h-4 mx-auto rounded-full bg-[#FAF0E4] border border-[#C59B27]/70 flex items-center justify-center text-[#B38738] text-[8px] shadow-xs select-none">
                        ❖
                      </div>
                      <p className="font-serif text-xs sm:text-sm font-bold text-[#4A0E17] leading-none pt-0.5">
                        Rahul &amp; Priya
                      </p>
                      <p className="text-[7px] sm:text-[8px] font-bold text-[#72092C] uppercase tracking-wider pt-0.5">
                        12 DEC 2025
                      </p>
                      <p className="text-[6px] sm:text-[7px] text-[#8C6D46] uppercase tracking-widest font-medium">
                        Udaipur, Rajasthan
                      </p>
                    </div>

                    {/* Bottom: Down Indicator & Home Line */}
                    <div className="relative z-10 w-full pb-0.5 space-y-1">
                      <div 
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#B38738] text-white flex items-center justify-center mx-auto shadow-xs"
                        aria-hidden="true"
                      >
                        <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </div>
                      <div className="w-8 sm:w-10 h-0.5 sm:h-1 bg-black/60 rounded-full mx-auto" aria-hidden="true" />
                    </div>

                  </div>
                </div>

                {/* Soft Contact Shadow below Smartphone */}
                <div 
                  className="w-[85%] mx-auto h-2 bg-black/35 blur-xs rounded-full mt-0.5 pointer-events-none" 
                  aria-hidden="true" 
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
