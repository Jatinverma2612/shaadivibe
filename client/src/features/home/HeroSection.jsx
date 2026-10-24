import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Eye, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { DiyaMotif, GaneshaSymbol, FloralDivider, WaxSealBadge } from '../../components/common/Motifs.jsx';

export const HeroSection = ({ content }) => {
  const headline = content?.headline || 'Craft Unforgettable Royal Indian Wedding Invitations';
  const subheadline =
    content?.subheadline ||
    'Celebrate sacred vows with 3D animated envelope reveals, personalized ceremony timelines, interactive cards, and live auspicious countdowns.';
  const primaryCtaText = content?.primaryCtaText || 'Browse Royal Themes';
  const secondaryCtaText = content?.secondaryCtaText || 'Experience Live Demo';

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
        <div className="absolute -top-24 left-10 w-96 h-96 rounded-full bg-royal-gold-400 blur-3xl" />
        <div className="absolute top-1/2 right-10 w-80 h-80 rounded-full bg-royal-maroon-700 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="gold" size="md">
                <Sparkles className="w-3.5 h-3.5 text-royal-gold-800" />
                <span>Next-Gen Royal Indian Invitations</span>
              </Badge>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-royal-maroon-800 tracking-tight leading-[1.15]">
              {headline}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-royal-brown-700 max-w-2xl leading-relaxed font-medium">
              {subheadline}
            </p>

            <FloralDivider className="w-44 h-4 text-royal-gold-500 my-4" />

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/themes">
                <Button variant="gold" size="lg" className="shadow-royal-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {primaryCtaText}
                </Button>
              </Link>

              <Link to="/invite/priya-and-rohan">
                <Button variant="outline" size="lg" className="shadow-sm">
                  <Eye className="w-5 h-5 mr-2" />
                  {secondaryCtaText}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-royal-gold-400/30 grid grid-cols-3 gap-4">
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-royal-maroon-800 block">
                  12,000+
                </span>
                <span className="text-[11px] uppercase tracking-wider text-royal-brown-600 font-semibold">
                  Royal Celebrations
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-royal-gold-700 block">
                  100%
                </span>
                <span className="text-[11px] uppercase tracking-wider text-royal-brown-600 font-semibold">
                  Mobile & WhatsApp Ready
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-royal-maroon-800 block">
                  50+
                </span>
                <span className="text-[11px] uppercase tracking-wider text-royal-brown-600 font-semibold">
                  Auspicious Themes
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Envelope Teaser Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-md"
            >
              <Link to="/invite/priya-and-rohan" className="block group">
                <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-royal-maroon-900 via-royal-maroon-800 to-royal-maroon-950 p-6 sm:p-8 shadow-royal-lg border-2 border-royal-gold-500/60 flex flex-col justify-between items-center text-center transform group-hover:-translate-y-2 group-hover:shadow-gold-glow transition-all duration-300">
                  {/* Ornate corner florets */}
                  <div className="absolute top-3 left-3 text-royal-gold-400 text-lg select-none">❖</div>
                  <div className="absolute top-3 right-3 text-royal-gold-400 text-lg select-none">❖</div>
                  <div className="absolute bottom-3 left-3 text-royal-gold-400 text-lg select-none">❖</div>
                  <div className="absolute bottom-3 right-3 text-royal-gold-400 text-lg select-none">❖</div>

                  {/* Header */}
                  <div className="space-y-1">
                    <GaneshaSymbol className="w-10 h-10 text-royal-gold-400 mx-auto" />
                    <span className="text-[9px] uppercase tracking-[0.25em] text-royal-gold-300 font-bold block">
                      ॥ श्री गणेशाय नमः ॥
                    </span>
                    <p className="font-serif text-xs uppercase tracking-widest text-royal-gold-200 font-semibold">
                      Royal Wedding Invitation
                    </p>
                  </div>

                  {/* Couple Initials & Wax Seal */}
                  <div className="my-auto space-y-3">
                    <WaxSealBadge
                      initials="P & R"
                      size="md"
                      className="shadow-wax-seal group-hover:scale-110 transition-transform"
                    />
                    <div className="space-y-0.5">
                      <p className="font-serif text-xl sm:text-2xl font-bold text-royal-gold-300">
                        Priya & Rohan
                      </p>
                      <p className="text-[11px] text-royal-gold-400/80 font-serif italic">
                        The Oberoi Udaivilas, Udaipur
                      </p>
                    </div>
                  </div>

                  {/* Call to action badge */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-royal-gold-200 bg-royal-maroon-950/80 px-4 py-2 rounded-full border border-royal-gold-400/50 group-hover:bg-royal-gold-500 group-hover:text-royal-brown-950 transition-colors shadow-sm">
                    <span>Tap to Experience 3D Reveal</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
