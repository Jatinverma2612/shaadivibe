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
    <section id="features" className="py-16 sm:py-20 bg-floral-blush/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-floral-gold">
            Auspicious Digital Innovation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-floral-burgundy tracking-wide mt-1">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-floral-brown/85 max-w-xl mx-auto mt-2 leading-relaxed">
            {subtitle}
          </p>
          <FloralDivider className="w-40 h-3 text-floral-gold mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featureItems.map((item, idx) => {
            const Icon = typeof item.icon === 'string' ? Sparkles : item.icon;
            return (
              <Card
                key={idx}
                ornate={true}
                className="p-6 sm:p-8 text-left hover:border-floral-gold hover:shadow-royal-lg transition-all duration-300 bg-white border border-floral-gold/30 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-floral-blush border border-royal-rose/30 flex items-center justify-center text-floral-burgundy mb-4 sm:mb-5 shadow-sm">
                    <Icon className="w-6 h-6 text-floral-burgundy" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-floral-burgundy tracking-wide mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-floral-brown/85 leading-relaxed">
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
