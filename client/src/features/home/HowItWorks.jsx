import React from 'react';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Palette, Edit3, Send, Sparkles } from 'lucide-react';

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
    <section id="how-it-works" className="py-20 bg-royal-ivory-warm/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-gold-700">
            Effortless Elegance
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-royal-maroon-800 tracking-wide mt-1">
            How ShaadiVibe Works
          </h2>
          <p className="text-xs sm:text-sm text-royal-brown-600 max-w-md mx-auto mt-2">
            Create and send your bespoke digital wedding invitation in three simple, joyful steps.
          </p>
          <FloralDivider className="w-40 h-3 text-royal-gold-500 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card
                key={idx}
                ornate={true}
                className="p-8 text-center bg-royal-ivory-card border border-royal-gold-400/40 shadow-royal flex flex-col items-center justify-between"
              >
                <div>
                  <div className="font-serif text-3xl font-extrabold text-royal-gold-600/50 mb-2">
                    {step.number}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-royal-gold-100 border border-royal-gold-400 flex items-center justify-center text-royal-maroon-800 mx-auto mb-4 shadow-sm">
                    <Icon className="w-6 h-6 text-royal-gold-700" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-royal-maroon-800 tracking-wide mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-royal-brown-600 leading-relaxed">
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
