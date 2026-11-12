import React from 'react';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Star, Quote } from 'lucide-react';

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
    <section className="py-16 sm:py-20 bg-floral-blush/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="gold" size="sm">
              <span>Customer Stories</span>
            </Badge>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-floral-burgundy tracking-wide">
            Cherished by Couples & Families
          </h2>
          <p className="text-xs sm:text-sm text-floral-brown/85 max-w-md mx-auto mt-2 leading-relaxed">
            Read how couples created lasting first impressions with ShaadiVibe royal invitations.
          </p>
          <FloralDivider className="w-40 h-3 text-floral-gold mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              ornate={true}
              className="p-6 sm:p-8 text-left bg-white border border-floral-gold/30 shadow-royal rounded-2xl flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-3 text-floral-gold">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-floral-gold text-floral-gold" />
                  ))}
                </div>

                <Quote className="w-7 h-7 text-floral-gold/50 mb-2" />

                <p className="text-xs sm:text-sm text-floral-brown/90 italic leading-relaxed mb-6 font-medium">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-floral-gold/20">
                <h4 className="font-serif text-base font-bold text-floral-burgundy">
                  {t.couple}
                </h4>
                <div className="flex items-center justify-between text-xs text-floral-brown/70 mt-0.5">
                  <span>{t.city}</span>
                  <span className="text-floral-gold font-semibold">{t.theme}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
