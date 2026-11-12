import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, MailOpen, CalendarDays, Clock } from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { GaneshaSymbol, WaxSealBadge } from '../../components/common/Motifs.jsx';

export const InvitationShowcaseSection = () => {
  return (
    <section id="sample-card" className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#FBF8F4] via-[#FDFBF7] to-[#F7EFE6] border-t border-floral-gold/30 overflow-hidden">
      {/* Delicate background blur elements */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-floral-rose/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-royal-gold-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Headings, Feature List & CTA */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="gold" size="md" className="border-floral-gold/50 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-floral-burgundy mr-1" />
                <span>Interactive 3D Experience</span>
              </Badge>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-floral-burgundy tracking-tight leading-[1.18]">
                Experience Our Signature Royal Invitation
              </h2>

              <p className="text-sm sm:text-base md:text-[17px] text-floral-brown leading-relaxed font-normal max-w-xl">
                Tap the card to unseal the 3D royal envelope with traditional Sanskrit blessings, an authentic wax seal reveal, and an auspicious wedding countdown.
              </p>
            </div>

            {/* Subtle Royal Divider */}
            <div className="flex items-center gap-2 w-32 py-0.5" aria-hidden="true">
              <span className="h-[1px] bg-gradient-to-r from-transparent via-[#C59B27] to-[#C59B27] flex-1" />
              <span className="text-[#C59B27] text-xs">❖</span>
              <span className="h-[1px] bg-gradient-to-r from-[#C59B27] via-[#C59B27] to-transparent flex-1" />
            </div>

            {/* Concise Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 max-w-xl">
              <div className="flex items-start gap-3 bg-white/75 backdrop-blur-xs p-3 rounded-xl border border-floral-gold/30 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#72092C]">
                  <MailOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17]">3D Envelope &amp; Wax Seal</h4>
                  <p className="text-[11px] sm:text-xs text-[#6B554E] leading-snug">Interactive unsealing with tactile wax seal cracking</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/75 backdrop-blur-xs p-3 rounded-xl border border-floral-gold/30 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#72092C]">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17]">Multi-Day Itinerary</h4>
                  <p className="text-[11px] sm:text-xs text-[#6B554E] leading-snug">Haldi, Mehendi, Sangeet &amp; Reception timings</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/75 backdrop-blur-xs p-3 rounded-xl border border-floral-gold/30 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#72092C]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17]">Interactive Cards</h4>
                  <p className="text-[11px] sm:text-xs text-[#6B554E] leading-snug">Touch-friendly cards for vows, dress code &amp; maps</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/75 backdrop-blur-xs p-3 rounded-xl border border-floral-gold/30 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#72092C]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17]">Live Countdown</h4>
                  <p className="text-[11px] sm:text-xs text-[#6B554E] leading-snug">Auspicious real-time muhurat timer for guests</p>
                </div>
              </div>
            </div>

            {/* Clear CTA linked to existing demo route */}
            <div className="pt-2">
              <Link
                to="/invite/priya-and-rohan"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#72092C] hover:bg-[#5C061D] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#72092C] focus:ring-offset-2"
                aria-label="Experience Live Demo"
              >
                <span>Experience Live Demo</span>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: The Exact Preserved Maroon 3D Royal Invitation Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative w-full max-w-[340px] sm:max-w-[380px]"
            >
              <Link to="/invite/priya-and-rohan" className="block group">
                <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-royal-maroon-900 via-royal-maroon-800 to-royal-maroon-950 p-6 sm:p-8 shadow-royal-lg border-2 border-floral-gold/70 flex flex-col justify-between items-center text-center transform group-hover:-translate-y-1.5 group-hover:shadow-gold-glow transition-all duration-300">
                  {/* Ornate corner florets */}
                  <div className="absolute top-3 left-3 text-[#FDF3DA] text-sm select-none opacity-90">❖</div>
                  <div className="absolute top-3 right-3 text-[#FDF3DA] text-sm select-none opacity-90">❖</div>
                  <div className="absolute bottom-3 left-3 text-[#FDF3DA] text-sm select-none opacity-90">❖</div>
                  <div className="absolute bottom-3 right-3 text-[#FDF3DA] text-sm select-none opacity-90">❖</div>

                  {/* Header Sanskrit Inscription */}
                  <div className="space-y-1">
                    <GaneshaSymbol className="w-9 h-9 sm:w-10 sm:h-10 text-[#FDF3DA] mx-auto" />
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#FDF3DA] font-bold block drop-shadow-sm">
                      ॥ श्री गणेशाय नमः ॥
                    </span>
                    <p className="font-serif text-xs uppercase tracking-widest text-[#FFF9F4] font-semibold">
                      Royal Wedding Invitation
                    </p>
                  </div>

                  {/* Couple Initials & 3D Wax Seal */}
                  <div className="my-auto space-y-2.5">
                    <WaxSealBadge
                      initials="P &amp; R"
                      size="md"
                      className="shadow-wax-seal group-hover:scale-110 transition-transform"
                    />
                    <div className="space-y-1">
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#FDF3DA] drop-shadow-sm">
                        Priya &amp; Rohan
                      </p>
                      <p className="text-xs text-[#F8E7E5] font-serif italic">
                        The Oberoi Udaivilas, Udaipur
                      </p>
                    </div>
                  </div>

                  {/* Interactive Tap Prompt with Clear Contrast */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFF9F4] bg-white/15 px-4 py-2 rounded-full border border-floral-gold/80 group-hover:bg-floral-gold group-hover:text-[#260209] transition-colors shadow-sm">
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
