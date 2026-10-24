import React from 'react';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Star, Heart, Quote } from 'lucide-react';

export const TestimonialsSection = ({ content }) => {
  const testimonials = content?.items || [
    {
      id: 't-1',
      couple: 'Aanya & Kabir',
      city: 'New Delhi & London',
      theme: 'Royal Udaipur Palace',
      quote:
        'Our guests across the UK and India were completely captivated when the gold wax seal opened! It felt like receiving an authentic royal decree from a heritage palace.',
      rating: 5,
    },
    {
      id: 't-2',
      couple: 'Meera & Siddharth',
      city: 'Mumbai & Jaipur',
      theme: 'Jaipur Jharokha Gold',
      quote:
        'Managing 6 different ceremonies from Haldi to Reception was seamless. Guests loved the dress code guidelines and map directions directly on their phones.',
      rating: 5,
    },
    {
      id: 't-3',
      couple: 'Rhea & Dev',
      city: 'Bengaluru & California',
      theme: 'Gulmohar Pastel Romance',
      quote:
        'The falling petals and elegant typography created pure magic. The live countdown built so much anticipation among our cousins and family WhatsApp groups!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-royal-ivory-warm/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="ivory" size="sm">
              <span>Customer Stories (Demo Content)</span>
            </Badge>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-royal-maroon-800 tracking-wide">
            Cherished by Couples & Families
          </h2>
          <p className="text-xs sm:text-sm text-royal-brown-600 max-w-md mx-auto mt-2">
            Read how couples created lasting first impressions with ShaadiVibe royal invitations.
          </p>
          <FloralDivider className="w-40 h-3 text-royal-gold-500 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              ornate={true}
              className="p-8 text-left bg-royal-ivory-card border border-royal-gold-400/40 shadow-royal flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4 text-royal-gold-600">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-royal-gold-500 text-royal-gold-500" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-royal-gold-400/50 mb-2" />

                <p className="text-xs sm:text-sm text-royal-brown-700 italic leading-relaxed mb-6 font-medium">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-royal-gold-400/30">
                <h4 className="font-serif text-base font-bold text-royal-maroon-800">
                  {t.couple}
                </h4>
                <div className="flex items-center justify-between text-xs text-royal-brown-500 mt-0.5">
                  <span>{t.city}</span>
                  <span className="text-royal-gold-700 font-semibold">{t.theme}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
