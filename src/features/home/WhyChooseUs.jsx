import React from 'react';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider, DiyaMotif, LotusMotif, KalashMotif } from '../../components/common/Motifs.jsx';
import { Check, Sparkles, Smartphone, HeartHandshake, TreePine } from 'lucide-react';

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
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 text-left space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-royal-gold-700">
              The ShaadiVibe Distinction
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-royal-maroon-800 tracking-wide leading-tight">
              Honoring Sacred Traditions With Modern Luxury
            </h2>
            <p className="text-sm sm:text-base text-royal-brown-700 leading-relaxed font-medium">
              Indian weddings are multi-day festivals of love, family, and intricate cultural rituals.
              ShaadiVibe ensures every ceremony from Haldi to Reception is announced with the grandeur and respect it deserves.
            </p>
            <FloralDivider className="w-40 h-3 text-royal-gold-500 my-4" />

            <div className="space-y-4">
              {points.map((p, i) => {
                const IconComponent = p.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-royal-ivory-card border border-royal-gold-300/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-royal-gold-100 border border-royal-gold-400 flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6 text-royal-gold-700" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-royal-maroon-800">
                        {p.title}
                      </h4>
                      <p className="text-xs text-royal-brown-600 mt-1 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-6">
            <Card
              ornate={true}
              className="p-8 sm:p-10 text-center bg-gradient-to-br from-royal-maroon-900 to-royal-maroon-950 text-royal-ivory-DEFAULT border-2 border-royal-gold-500/60 shadow-royal-lg"
            >
              <div className="space-y-4 max-w-md mx-auto">
                <DiyaMotif className="w-12 h-12 text-royal-gold-400 mx-auto" />
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-royal-gold-300">
                  "A Royal Celebration Deserves a Royal Proclamation"
                </h3>
                <p className="text-xs sm:text-sm text-royal-ivory-warm/80 leading-relaxed">
                  Join couples in Delhi, Mumbai, Bengaluru, Jaipur, London, and New York who chose ShaadiVibe to invite their loved ones.
                </p>
                <div className="pt-4 border-t border-royal-gold-500/30 flex items-center justify-center gap-6 text-xs text-royal-gold-300">
                  <span>✦ 100% Digital Kept Forever</span>
                  <span>✦ Zero Carbon Footprint</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
