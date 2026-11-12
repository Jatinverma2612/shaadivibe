import React from 'react';
import { Link } from 'react-router-dom';
import { FloralDivider, DiyaMotif } from '../../components/common/Motifs.jsx';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CtaBanner = () => {
  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-royal-maroon-900 via-royal-maroon-800 to-royal-maroon-950 p-6 sm:p-12 lg:p-14 text-center text-[#FFF9F4] border-2 border-floral-gold/60 shadow-royal-lg overflow-hidden burgundy-card">
          {/* Subtle gold floret background */}
          <div className="absolute inset-0 bg-palace-dark opacity-35 pointer-events-none" />

          <div className="relative z-10 space-y-5 sm:space-y-6 max-w-2xl mx-auto">
            <DiyaMotif className="w-10 h-10 sm:w-12 sm:h-12 text-[#FDF3DA] mx-auto" />

            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-[#FDF3DA] tracking-wide leading-tight">
              Ready to Announce Your Sacred Union?
            </h2>

            <p className="text-sm sm:text-base text-[#FFF9F4] leading-relaxed font-medium">
              Create your bespoke Indian digital wedding invitation with 3D envelope reveals, personalized multi-day
              itinerary, and live countdown in minutes.
            </p>

            <FloralDivider className="w-40 h-3 text-floral-gold mx-auto" />

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link to="/customize/theme-1" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 min-h-[50px] rounded-xl text-base font-bold bg-gradient-to-r from-royal-gold-600 via-royal-gold-500 to-royal-gold-700 text-[#260209] hover:brightness-110 shadow-royal hover:shadow-gold-glow border border-floral-gold transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2 text-[#260209]" />
                  <span>Begin Customization Now</span>
                </button>
              </Link>

              <Link to="/themes" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 min-h-[50px] rounded-xl text-base font-semibold bg-white/10 text-[#FFF9F4] hover:bg-white/20 border-2 border-floral-gold/80 transition-all shadow-sm"
                >
                  <span>Browse All Themes</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-[#FDF3DA]" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
