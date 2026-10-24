import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { WaxSealBadge, OrnateCorner, FloralDivider, GaneshaSymbol } from '../../components/common/Motifs.jsx';
import { Sparkles, Heart, ChevronDown } from 'lucide-react';
import { formatWeddingDate } from '../../utils/dateUtils.js';

export const EnvelopeOpening = ({
  invitation,
  onOpenComplete,
  isInitiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const [isOpening, setIsOpening] = useState(false);

  const {
    brideName = 'Priya',
    groomName = 'Rohan',
    weddingDate,
    tagline = 'Two Souls, One Sacred Journey',
  } = invitation || {};

  // Extract couple initials for wax seal (e.g. "P & R")
  const brideInitial = brideName ? brideName.trim().charAt(0).toUpperCase() : 'B';
  const groomInitial = groomName ? groomName.trim().charAt(0).toUpperCase() : 'G';
  const sealInitials = `${brideInitial} & ${groomInitial}`;

  const handleOpenEnvelope = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);

    // Launch elegant gold & rose confetti
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E5C258', '#8E1C37', '#FAF7F2'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      if (onOpenComplete) onOpenComplete();
    }, 1200);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[560px]">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ========================================================================= */
          /* STAGE 1: CLOSED ROYAL ENVELOPE                                            */
          /* ========================================================================= */
          <motion.div
            key="closed-envelope"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-lg aspect-[4/3] rounded-2xl bg-gradient-to-br from-royal-maroon-900 via-royal-maroon-800 to-royal-maroon-950 p-6 shadow-royal-lg border-2 border-royal-gold-500/60 perspective-1000 flex flex-col items-center justify-between cursor-pointer select-none group"
            onClick={handleOpenEnvelope}
          >
            {/* Ornate Gold Corners */}
            <div className="absolute top-3 left-3 pointer-events-none">
              <OrnateCorner position="top-left" className="w-8 h-8 text-royal-gold-400" />
            </div>
            <div className="absolute top-3 right-3 pointer-events-none">
              <OrnateCorner position="top-right" className="w-8 h-8 text-royal-gold-400" />
            </div>
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <OrnateCorner position="bottom-left" className="w-8 h-8 text-royal-gold-400" />
            </div>
            <div className="absolute bottom-3 right-3 pointer-events-none">
              <OrnateCorner position="bottom-right" className="w-8 h-8 text-royal-gold-400" />
            </div>

            {/* Envelope Triangular Fold Lines (SVG Visual) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-30">
              <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0 0 L200 150 L400 0" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
                <path d="M0 300 L160 140 M400 300 L240 140" stroke="#D4AF37" strokeWidth="1" fill="none" />
              </svg>
            </div>

            {/* Top Royal Crest */}
            <div className="z-10 text-center pt-2">
              <GaneshaSymbol className="w-10 h-10 text-royal-gold-400 mx-auto opacity-90" />
              <span className="text-[10px] font-serif uppercase tracking-[0.3em] text-royal-gold-300 font-semibold block mt-1">
                SHREE GANESHAY NAMAH
              </span>
            </div>

            {/* Center: Interactive Wax Seal Medallion */}
            <div className="z-20 my-auto flex flex-col items-center">
              <motion.div
                animate={isOpening ? { scale: [1, 1.2, 0], opacity: [1, 1, 0] } : { scale: [1, 1.04, 1] }}
                transition={
                  isOpening
                    ? { duration: 0.8 }
                    : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <WaxSealBadge
                  initials={sealInitials}
                  size="lg"
                  className="shadow-wax-seal group-hover:scale-110 transition-transform"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-4 flex items-center gap-1.5 text-xs uppercase tracking-widest text-royal-gold-300 font-semibold bg-royal-maroon-950/80 px-4 py-1.5 rounded-full border border-royal-gold-400/40 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-royal-gold-400 animate-pulse" />
                <span>Tap Wax Seal to Open</span>
              </motion.div>
            </div>

            {/* Bottom: Couple Monogram Preview */}
            <div className="z-10 text-center pb-2">
              <p className="font-serif text-sm tracking-widest text-royal-gold-200 uppercase font-semibold">
                The Wedding Of
              </p>
              <p className="font-serif text-lg tracking-wider text-royal-gold-400 font-bold">
                {brideName} & {groomName}
              </p>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* STAGE 2: REVEALED ROYAL INVITATION CARD (ANIMATED)                        */
          /* ========================================================================= */
          <motion.div
            key="opened-invitation"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100, duration: 0.8 }}
            className="relative w-full max-w-xl bg-gradient-to-b from-royal-ivory-card via-royal-ivory-warm/30 to-royal-gold-50/40 rounded-2xl p-8 sm:p-12 shadow-royal-lg border-2 border-royal-gold-500/50 ornate-border-lg text-center"
          >
            {/* Four Ornate Gold Corners */}
            <div className="absolute top-3 left-3 pointer-events-none">
              <OrnateCorner position="top-left" className="w-7 h-7 text-royal-gold-500" />
            </div>
            <div className="absolute top-3 right-3 pointer-events-none">
              <OrnateCorner position="top-right" className="w-7 h-7 text-royal-gold-500" />
            </div>
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <OrnateCorner position="bottom-left" className="w-7 h-7 text-royal-gold-500" />
            </div>
            <div className="absolute bottom-3 right-3 pointer-events-none">
              <OrnateCorner position="bottom-right" className="w-7 h-7 text-royal-gold-500" />
            </div>

            {/* Auspicious Invocation Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4"
            >
              <GaneshaSymbol className="w-12 h-12 text-royal-gold-600 mx-auto mb-1" />
              <span className="text-xs font-serif uppercase tracking-[0.25em] text-royal-maroon-800 font-bold block">
                ॥ श्री गणेशाय नमः ॥
              </span>
              <span className="text-[10px] uppercase tracking-widest text-royal-gold-700 font-semibold">
                Together With Their Families
              </span>
            </motion.div>

            {/* Staggered Bride and Groom Reveals */}
            <div className="my-6 space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="font-serif text-3xl sm:text-5xl font-black gold-text-gradient tracking-wide"
              >
                {brideName}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="flex items-center justify-center gap-3 text-royal-maroon-700"
              >
                <div className="h-[1px] w-12 bg-royal-gold-400" />
                <span className="font-serif text-xl sm:text-2xl italic font-semibold text-royal-gold-700">
                  and
                </span>
                <div className="h-[1px] w-12 bg-royal-gold-400" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="font-serif text-3xl sm:text-5xl font-black gold-text-gradient tracking-wide"
              >
                {groomName}
              </motion.h1>
            </div>

            <FloralDivider className="w-40 h-4 text-royal-gold-500 mx-auto my-4" />

            {/* Tagline */}
            {tagline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="font-serif text-sm sm:text-base italic text-royal-brown-700 font-medium max-w-sm mx-auto"
              >
                "{tagline}"
              </motion.p>
            )}

            {/* Wedding Date Announcement */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mt-6 pt-6 border-t border-royal-gold-400/30"
            >
              <span className="text-[11px] uppercase tracking-widest text-royal-gold-700 font-bold block mb-1">
                Save The Date
              </span>
              <p className="font-serif text-xl sm:text-2xl font-bold text-royal-maroon-800 tracking-wide">
                {formatWeddingDate(weddingDate)}
              </p>
            </motion.div>

            {/* Scroll Down Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-8 flex flex-col items-center text-xs text-royal-gold-700 font-semibold tracking-wider uppercase animate-bounce"
            >
              <span>Scroll to Explore Ceremonies</span>
              <ChevronDown className="w-4 h-4 mt-1 text-royal-gold-600" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
