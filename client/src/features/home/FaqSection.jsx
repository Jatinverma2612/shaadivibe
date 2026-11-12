import React, { useState } from 'react';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection = ({ content }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = content?.items || [
    {
      question: 'How do guests open and experience our digital wedding invitation?',
      answer:
        'You receive a unique, personalized web link (e.g., shaadivibe.com/invite/priya-and-rohan). You can share this link on WhatsApp, SMS, or Email. When guests tap the link on any phone or computer, they see a velvet closed royal envelope with your gold monogram wax seal. Tapping the wax seal unwraps the envelope in smooth 3D motion!',
    },
    {
      question: 'Can I add multiple wedding ceremonies like Haldi, Mehendi, Sangeet, and Reception?',
      answer:
        'Yes! ShaadiVibe features a comprehensive multi-day ceremony itinerary editor. You can add, edit, or remove ceremonies, configure dates, timings, venues, and descriptions. On the invitation, guests view these on an animated timeline.',
    },
    {
      question: 'Can I update event details or timings after sharing the invitation link?',
      answer:
        'Absolutely. You can edit your wedding details, ceremony timings, venue location, or photos anytime from your dashboard. When guests open or refresh the link, they immediately see the updated information—zero reprint cost or delay.',
    },
    {
      question: 'Is ShaadiVibe mobile-friendly and fast on 4G/5G?',
      answer:
        'Yes! Over 85% of wedding guests view invitations on smartphones. ShaadiVibe is crafted mobile-first with silky-smooth animations, touch gesture support, and optimized image compression.',
    },
    {
      question: 'How many photos can I include in our invitation gallery?',
      answer:
        'In Phase 1, you can upload up to 6 high-definition romantic couple portraits or pre-wedding photos that are showcased on the invitation card.',
    },
  ];

  return (
    <section id="faqs" className="py-16 sm:py-20 bg-floral-blush/30 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-floral-gold">
            Got Questions?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-floral-burgundy tracking-wide mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-floral-brown/85 max-w-md mx-auto mt-2 leading-relaxed">
            Everything you need to know about creating and sharing your royal digital wedding invitation.
          </p>
          <FloralDivider className="w-40 h-3 text-floral-gold mx-auto mt-3" />
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Card
                key={index}
                ornate={false}
                className="p-0 overflow-hidden bg-white border border-floral-gold/30 shadow-sm rounded-2xl transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-3 font-serif text-base sm:text-lg font-bold text-floral-burgundy hover:text-royal-maroon-600 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-floral-gold shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-floral-gold shrink-0 transform transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-floral-brown leading-relaxed border-t border-floral-gold/20 font-medium">
                    {faq.answer}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
