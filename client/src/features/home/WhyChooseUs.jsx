import React from 'react';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider, DiyaMotif, LotusMotif, KalashMotif } from '../../components/common/Motifs.jsx';

export const WhyChooseUs = () => {
  const points = [
    {
      title: 'Centuries of Heritage, Modern Tech',
      desc: 'Authentic Indian aesthetic details including Ganesh invocations, mandap arches, royal wax seals, and Vedic ceremony timelines.',
      icon: DiyaMotif,
    },
    {
      title: 'Eco-Friendly Royalty (Zero Paper Waste)',
      desc: 'Save thousands on paper printing and couriers while providing guests with an unforgettable, interactive digital keepsake.',
      icon: LotusMotif,
    },
    {
      title: 'Real-Time Ceremony Adjustments',
      desc: 'Weather change or time shift? Update your wedding itinerary or venue pin instantly without reprinting hundreds of cards.',
      icon: KalashMotif,
    },
  ];

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 text-left space-y-5 sm:space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-floral-gold">
              The ShaadiVibe Distinction
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-floral-burgundy tracking-wide leading-tight">
              Honoring Sacred Traditions With Modern Luxury
            </h2>
            <p className="text-sm sm:text-base text-floral-brown leading-relaxed font-medium">
              Indian weddings are multi-day festivals of love, family, and intricate cultural rituals.
              ShaadiVibe ensures every ceremony from Haldi to Reception is announced with the grandeur and respect it deserves.
            </p>
            <FloralDivider className="w-40 h-3 text-floral-gold my-3" />

            <div className="space-y-3.5">
              {points.map((p, i) => {
                const IconComponent = p.icon;
                return (
                  <div key={i} className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-floral-gold/30 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-floral-blush border border-royal-rose/30 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-floral-burgundy" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-floral-burgundy">
                        {p.title}
                      </h4>
                      <p className="text-xs text-floral-brown/85 mt-1 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Visual Card - Guaranteed High Contrast on Burgundy */}
          <div className="lg:col-span-6">
            <Card
              ornate={true}
              variant="maroon"
              className="p-8 sm:p-10 text-center bg-gradient-to-br from-royal-maroon-900 to-royal-maroon-950 text-[#FFF9F4] border-2 border-floral-gold/60 shadow-royal-lg rounded-3xl"
            >
              <div className="space-y-4 max-w-md mx-auto">
                <DiyaMotif className="w-12 h-12 text-[#FDF3DA] mx-auto" />
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FDF3DA] leading-snug">
                  "A Royal Celebration Deserves a Royal Proclamation"
                </h3>
                <p className="text-sm text-[#FFF9F4] leading-relaxed font-medium">
                  Join couples in Delhi, Mumbai, Bengaluru, Jaipur, London, and New York who chose ShaadiVibe to invite their loved ones.
                </p>
                <div className="pt-4 border-t border-floral-gold/30 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#FDF3DA]">
                  <span className="bg-white/10 px-3.5 py-1.5 rounded-full border border-floral-gold/40">
                    ✦ 100% Digital Kept Forever
                  </span>
                  <span className="bg-white/10 px-3.5 py-1.5 rounded-full border border-floral-gold/40">
                    ✦ Zero Carbon Footprint
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
