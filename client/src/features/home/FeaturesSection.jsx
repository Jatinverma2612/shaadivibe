import React from 'react';
import { MailOpen, CalendarDays, Sparkles, Clock, Smartphone, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';

export const FeaturesSection = ({ content }) => {
  const title = content?.title || 'Why Modern Couples Choose ShaadiVibe';
  const subtitle =
    content?.subtitle ||
    'Infusing centuries of regal Indian heritage with seamless, touch-friendly interactive web technology.';

  const featureItems = content?.items || [
    {
      icon: MailOpen,
      title: '3D Envelope & Wax Seal',
      description: 'Guests tap an authentic gold wax seal to watch their velvet envelope open with 3D perspective animations.',
    },
    {
      icon: CalendarDays,
      title: 'Multi-Day Event Itinerary',
      description: 'Effortlessly showcase Haldi, Mehendi, Sangeet, Baraat, Pheras, and Reception with dates, times, and map pins.',
    },
    {
      icon: Sparkles,
      title: 'Interactive Decorative Cards',
      description: 'Reveal Sacred Vows, Dress Code Color Palettes, and Accommodations with smooth touch-friendly cards.',
    },
    {
      icon: Clock,
      title: 'Auspicious Live Countdown',
      description: 'Ticking countdown timer down to the auspicious wedding hour with celebratory golden confetti.',
    },
    {
      icon: Smartphone,
      title: '100% Mobile & WhatsApp Ready',
      description: 'Designed mobile-first with silky-smooth animations and direct one-tap sharing to family WhatsApp groups.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Waste & Instant Updates',
      description: 'Eco-friendly digital elegance. Update venues, timings, or photos anytime without expensive paper reprint lag.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-royal-ivory-warm/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-gold-700">
            Auspicious Digital Innovation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-royal-maroon-800 tracking-wide mt-1">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-royal-brown-600 max-w-xl mx-auto mt-2 leading-relaxed">
            {subtitle}
          </p>
          <FloralDivider className="w-40 h-3 text-royal-gold-500 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureItems.map((item, idx) => {
            const Icon = typeof item.icon === 'string' ? Sparkles : item.icon;
            return (
              <Card
                key={idx}
                ornate={true}
                className="p-8 text-left hover:border-royal-gold-500 hover:shadow-royal-lg transition-all duration-300 bg-royal-ivory-card border border-royal-gold-400/30 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-royal-gold-100 border border-royal-gold-400 flex items-center justify-center text-royal-maroon-800 mb-5 shadow-sm">
                    <Icon className="w-6 h-6 text-royal-gold-700" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-royal-maroon-800 tracking-wide mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-royal-brown-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
