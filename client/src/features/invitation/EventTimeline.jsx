import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Palette,
  Music,
  Crown,
  Flame,
  UtensilsCrossed,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';

export const EventTimeline = ({ events = [] }) => {
  const getEventIcon = (iconName, title = '') => {
    const lowerTitle = title.toLowerCase();
    if (iconName === 'Sun' || lowerTitle.includes('haldi')) {
      return <Sun className="w-5 h-5 text-amber-500" />;
    }
    if (iconName === 'Palette' || lowerTitle.includes('mehendi')) {
      return <Palette className="w-5 h-5 text-emerald-600" />;
    }
    if (iconName === 'Music' || lowerTitle.includes('sangeet')) {
      return <Music className="w-5 h-5 text-purple-600" />;
    }
    if (iconName === 'Crown' || lowerTitle.includes('baraat') || lowerTitle.includes('sagai')) {
      return <Crown className="w-5 h-5 text-royal-gold-600" />;
    }
    if (iconName === 'Flame' || lowerTitle.includes('pheras') || lowerTitle.includes('shaadi')) {
      return <Flame className="w-5 h-5 text-red-600" />;
    }
    if (iconName === 'UtensilsCrossed' || lowerTitle.includes('reception') || lowerTitle.includes('dinner')) {
      return <UtensilsCrossed className="w-5 h-5 text-royal-maroon-700" />;
    }
    return <Sparkles className="w-5 h-5 text-royal-gold-600" />;
  };

  if (!events || events.length === 0) return null;

  return (
    <div className="py-14 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-royal-gold-700">
          Sacred Ceremonies
        </span>
        <h3 className="font-serif text-3xl md:text-4xl font-bold text-royal-maroon-800 tracking-wide mt-1">
          Wedding Event Itinerary
        </h3>
        <p className="text-xs sm:text-sm text-royal-brown-600 max-w-md mx-auto mt-2">
          Join us as we celebrate each joyous chapter of love, ritual, and family celebration.
        </p>
        <FloralDivider className="w-36 h-3 text-royal-gold-500 mx-auto mt-3" />
      </div>

      <div className="relative">
        {/* Connecting Golden Spine Line */}
        <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-royal-gold-300 via-royal-gold-500 to-royal-gold-300 transform -translate-x-1/2" />

        <div className="space-y-8 sm:space-y-12">
          {events.map((event, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col sm:flex-row items-start ${
                  isEven ? 'sm:flex-row-reverse' : ''
                } gap-6 sm:gap-12`}
              >
                {/* Center Icon Marker */}
                <div className="absolute left-6 sm:left-1/2 top-4 transform -translate-x-1/2 z-10 w-12 h-12 rounded-full bg-royal-ivory-card border-2 border-royal-gold-500 shadow-royal flex items-center justify-center">
                  {getEventIcon(event.icon, event.title)}
                </div>

                {/* Event Content Card */}
                <div
                  className={`w-full sm:w-[calc(50%-2.5rem)] pl-16 sm:pl-0 ${
                    isEven ? 'sm:text-left' : 'sm:text-right'
                  }`}
                >
                  <Card
                    ornate={false}
                    className="p-5 sm:p-6 bg-royal-ivory-card border-2 border-royal-gold-400/40 shadow-royal hover:border-royal-gold-500 transition-colors"
                  >
                    <div
                      className={`flex flex-wrap items-center gap-2 mb-2 ${
                        isEven ? 'justify-start' : 'sm:justify-end justify-start'
                      }`}
                    >
                      <span className="inline-flex items-center text-xs font-bold text-royal-maroon-700 bg-royal-maroon-50 px-2.5 py-0.5 rounded-full border border-royal-maroon-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        {event.date}
                      </span>
                      <span className="inline-flex items-center text-xs font-semibold text-royal-gold-800 bg-royal-gold-100 px-2.5 py-0.5 rounded-full border border-royal-gold-300">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.time}
                      </span>
                    </div>

                    <h4 className="font-serif text-xl font-bold text-royal-maroon-800 tracking-wide">
                      {event.title}
                    </h4>

                    {event.description && (
                      <p className="text-xs sm:text-sm text-royal-brown-600 mt-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {event.venue && (
                      <div
                        className={`flex items-center gap-1.5 text-xs text-royal-brown-700 font-medium mt-3 pt-3 border-t border-royal-gold-400/20 ${
                          isEven ? 'justify-start' : 'sm:justify-end justify-start'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-royal-gold-600 shrink-0" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
