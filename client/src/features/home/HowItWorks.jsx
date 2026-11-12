import React from 'react';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Palette, Edit3, Send } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: Palette,
      title: 'Choose Your Royal Theme',
      description:
        'Browse our curated collection of Rajasthani palace, Vedic marigold, and modern floral themes crafted by heritage artists.',
    },
    {
      number: '02',
      icon: Edit3,
      title: 'Personalize Details & Itinerary',
      description:
        'Fill in bride and groom names, add your multi-day ceremonies (Haldi, Mehendi, Sangeet, Pheras), and upload romantic couple portraits.',
    },
    {
      number: '03',
      icon: Send,
      title: 'Share With Loved Ones',
      description:
        'Receive your unique royal invitation URL. Share instantly on WhatsApp or SMS for guests to experience the magical 3D envelope reveal.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-floral-blush/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-floral-gold">
            Effortless Elegance
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-floral-burgundy tracking-wide mt-1">
            How ShaadiVibe Works
          </h2>
          <p className="text-xs sm:text-sm text-floral-brown/85 max-w-md mx-auto mt-2 leading-relaxed">
            Create and send your bespoke digital wedding invitation in three simple, joyful steps.
          </p>
          <FloralDivider className="w-40 h-3 text-floral-gold mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card
                key={idx}
                ornate={true}
                className="p-6 sm:p-8 text-center bg-white border border-floral-gold/30 shadow-royal rounded-2xl flex flex-col items-center justify-between"
              >
                <div>
                  <div className="font-serif text-3xl font-extrabold text-floral-gold/50 mb-2">
                    {step.number}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-floral-blush border border-royal-rose/30 flex items-center justify-center text-floral-burgundy mx-auto mb-4 shadow-sm">
                    <Icon className="w-6 h-6 text-floral-burgundy" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-floral-burgundy tracking-wide mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-floral-brown/85 leading-relaxed">
                    {step.description}
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
