import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Sparkles, MapPin, ChevronRight, Flower2, Info } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';

export const InteractiveCards = ({ cards = [] }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'HeartHandshake':
      case 'Heart':
        return <HeartHandshake className="w-7 h-7 text-royal-gold-600" />;
      case 'Sparkles':
        return <Sparkles className="w-7 h-7 text-royal-gold-600" />;
      case 'MapPin':
        return <MapPin className="w-7 h-7 text-royal-gold-600" />;
      default:
        return <Flower2 className="w-7 h-7 text-royal-gold-600" />;
    }
  };

  if (!cards || cards.length === 0) return null;

  return (
    <div className="py-12 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-royal-gold-700">
          Celebration Insights
        </span>
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-royal-maroon-800 tracking-wide mt-1">
          Cherished Details & Etiquette
        </h3>
        <p className="text-xs sm:text-sm text-royal-brown-600 max-w-md mx-auto mt-2">
          Tap each royal card to uncover special blessings, attire color palette, and hospitality guidance.
        </p>
        <FloralDivider className="w-36 h-3 text-royal-gold-500 mx-auto mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.id || index}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer"
            onClick={() => setSelectedCard(card)}
          >
            <Card
              ornate={true}
              className="h-full flex flex-col justify-between hover:shadow-royal-lg hover:border-royal-gold-500 transition-all duration-300 bg-gradient-to-b from-royal-ivory-card to-royal-gold-50/40 text-center p-6"
            >
              <div>
                <div className="w-14 h-14 mx-auto rounded-full bg-royal-gold-100 border border-royal-gold-400/60 flex items-center justify-center shadow-sm mb-4">
                  {getIcon(card.icon)}
                </div>

                <h4 className="font-serif text-lg font-bold text-royal-maroon-800 tracking-wide">
                  {card.title}
                </h4>

                {card.subtitle && (
                  <p className="text-xs uppercase tracking-widest text-royal-gold-700 font-semibold mt-1">
                    {card.subtitle}
                  </p>
                )}

                <p className="text-xs text-royal-brown-600 mt-3 line-clamp-2 leading-relaxed">
                  {card.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-royal-gold-500/20 flex items-center justify-center text-xs font-bold text-royal-maroon-700 group">
                <span>View Details</span>
                <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reveal Modal */}
      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title={selectedCard?.title}
        subtitle={selectedCard?.subtitle}
      >
        {selectedCard && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-royal-gold-100 border-2 border-royal-gold-400 flex items-center justify-center shadow-md">
              {getIcon(selectedCard.icon)}
            </div>

            <p className="text-sm md:text-base leading-relaxed text-royal-brown-800 whitespace-pre-line font-medium px-2">
              {selectedCard.content}
            </p>

            <div className="pt-4 text-xs text-royal-gold-700 italic">
              ✦ With sincere warmth and blessings from the hosts ✦
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
