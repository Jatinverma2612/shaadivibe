import React from 'react';
import { useCountdown } from '../../hooks/useCountdown.js';
import { Sparkles, Calendar, Clock } from 'lucide-react';
import { FloralDivider } from '../../components/common/Motifs.jsx';

export const CountdownTimer = ({ weddingDate, brideName, groomName }) => {
  const { days, hours, minutes, seconds, isPast, isToday } = useCountdown(weddingDate);

  if (isToday) {
    return (
      <div className="py-6 px-4 bg-royal-gold-100/80 border-2 border-royal-gold-500 rounded-2xl text-center max-w-lg mx-auto shadow-royal">
        <Sparkles className="w-8 h-8 text-royal-gold-600 mx-auto mb-2 animate-bounce" />
        <h3 className="font-serif text-2xl font-bold text-royal-maroon-800">
          The Auspicious Day is Here!
        </h3>
        <p className="text-sm text-royal-brown-700 mt-1">
          Today, {brideName} and {groomName} begin their sacred journey together.
        </p>
      </div>
    );
  }

  if (isPast) {
    return (
      <div className="py-5 px-4 bg-royal-ivory-warm border border-royal-gold-500/30 rounded-2xl text-center max-w-lg mx-auto">
        <h3 className="font-serif text-xl font-bold text-royal-maroon-800">
          Happily Solemnized
        </h3>
        <p className="text-sm text-royal-brown-600 mt-1">
          Thank you for showering your heartfelt blessings on {brideName} & {groomName}!
        </p>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ];

  return (
    <div className="py-8 px-4 text-center">
      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-royal-gold-700 mb-2">
        <Clock className="w-3.5 h-3.5 text-royal-gold-600" />
        <span>Auspicious Muhurat Countdown</span>
      </div>

      <h3 className="font-serif text-2xl md:text-3xl font-bold text-royal-maroon-800 tracking-wide mb-2">
        Counting Down to the Sacred Union
      </h3>
      <FloralDivider className="w-36 h-3 text-royal-gold-500 mx-auto mb-6" />

      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="relative bg-gradient-to-b from-royal-ivory-card to-royal-gold-50/70 border-2 border-royal-gold-400/60 rounded-xl p-3 sm:p-4 shadow-royal flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-200"
          >
            <div className="font-serif text-2xl sm:text-4xl font-black text-royal-maroon-800 tracking-tight">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-royal-brown-600 font-semibold mt-1">
              {unit.label}
            </div>
            {/* Subtle corner glints */}
            <div className="absolute top-1 left-1 w-1 h-1 bg-royal-gold-400 rounded-full opacity-60" />
            <div className="absolute top-1 right-1 w-1 h-1 bg-royal-gold-400 rounded-full opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
};
