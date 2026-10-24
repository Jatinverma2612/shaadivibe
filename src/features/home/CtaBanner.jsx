import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button.jsx';
import { FloralDivider, DiyaMotif } from '../../components/common/Motifs.jsx';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CtaBanner = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-royal-maroon-900 via-royal-maroon-800 to-royal-maroon-950 p-8 sm:p-14 text-center text-royal-ivory-DEFAULT border-2 border-royal-gold-500/60 shadow-royal-lg overflow-hidden">
          {/* Subtle gold floret background */}
          <div className="absolute inset-0 bg-palace-dark opacity-30 pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <DiyaMotif className="w-12 h-12 text-royal-gold-400 mx-auto" />

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-royal-gold-300 tracking-wide leading-tight">
              Ready to Announce Your Sacred Union?
            </h2>

            <p className="text-sm sm:text-base text-royal-ivory-warm/85 leading-relaxed">
              Create your bespoke Indian digital wedding invitation with 3D envelope reveals, personalized multi-day
              itinerary, and live countdown in minutes.
            </p>

            <FloralDivider className="w-40 h-3 text-royal-gold-500 mx-auto" />

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/customize/theme-1">
                <Button variant="gold" size="lg" className="shadow-royal-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Begin Customization Now
                </Button>
              </Link>

              <Link to="/themes">
                <Button variant="outline" size="lg" className="bg-transparent text-royal-gold-200 border-royal-gold-400 hover:bg-royal-gold-500/10">
                  <span>Browse All Themes</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
