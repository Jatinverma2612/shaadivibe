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
    <section id="faqs" className="py-20 bg-royal-ivory-warm/40 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-gold-700">
            Got Questions?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-royal-maroon-800 tracking-wide mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-royal-brown-600 max-w-md mx-auto mt-2">
            Everything you need to know about creating and sharing your royal digital wedding invitation.
          </p>
          <FloralDivider className="w-40 h-3 text-royal-gold-500 mx-auto mt-3" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Card
                key={index}
                ornate={false}
                className="p-0 overflow-hidden bg-royal-ivory-card border border-royal-gold-400/40 shadow-sm transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-bold text-royal-maroon-800 hover:text-royal-maroon-600 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-royal-gold-600 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-royal-gold-600 shrink-0 transform transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-royal-brown-700 leading-relaxed border-t border-royal-gold-400/20 font-medium">
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
