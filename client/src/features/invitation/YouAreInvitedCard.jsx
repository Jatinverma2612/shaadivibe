import React from 'react';
import { MapPin, Navigation, Heart } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { GaneshaSymbol, FloralDivider } from '../../components/common/Motifs.jsx';
import { formatWeddingDate } from '../../utils/dateUtils.js';

export const YouAreInvitedCard = ({ invitation }) => {
  const {
    brideName,
    groomName,
    weddingDate,
    familyMessage,
    venue,
    photos = [],
    tagline,
  } = invitation;

  return (
    <div className="py-10 px-4 max-w-4xl mx-auto">
      <Card
        ornate={true}
        className="p-8 sm:p-12 text-center bg-gradient-to-b from-royal-ivory-card via-royal-ivory-warm/40 to-royal-gold-50/50 shadow-royal-lg border-2 border-royal-gold-500/50"
      >
        {/* Auspicious Sacred Invocation */}
        <div className="mb-4 flex flex-col items-center">
          <GaneshaSymbol className="w-12 h-12 text-royal-gold-600 mb-2" />
          <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-royal-maroon-800 font-semibold">
            ॥ श्री गणेशाय नमः ॥
          </span>
          <span className="text-[10px] uppercase tracking-widest text-royal-gold-700 mt-0.5">
            With the divine grace of the Almighty & Ancestral Blessings
          </span>
        </div>

        {/* Proclamation Header */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-royal-maroon-800 tracking-wide mt-2">
          You Are Cordially Invited
        </h2>

        {tagline && (
          <p className="font-serif italic text-sm sm:text-base text-royal-gold-800 mt-2">
            "{tagline}"
          </p>
        )}

        <FloralDivider className="w-48 h-4 text-royal-gold-500 mx-auto my-6" />

        {/* Couple Names */}
        <div className="space-y-1 my-6">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold gold-text-gradient tracking-wide">
            {brideName}
          </h1>
          <div className="flex items-center justify-center gap-3 text-royal-maroon-700 my-1">
            <span className="h-[1px] w-12 bg-royal-gold-500/50" />
            <span className="font-serif text-xl sm:text-2xl font-semibold italic text-royal-gold-700">weds</span>
            <span className="h-[1px] w-12 bg-royal-gold-500/50" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold gold-text-gradient tracking-wide">
            {groomName}
          </h1>
        </div>

        {/* Family Message */}
        <div className="max-w-2xl mx-auto my-6 bg-royal-gold-100/40 p-4 sm:p-6 rounded-xl border border-royal-gold-300/40">
          <p className="text-sm sm:text-base leading-relaxed text-royal-brown-800 font-medium">
            {familyMessage}
          </p>
        </div>

        {/* Auspicious Date */}
        <div className="my-6">
          <span className="text-xs uppercase tracking-widest text-royal-gold-700 font-bold block mb-1">
            Auspicious Wedding Muhurat
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-royal-maroon-800">
            {formatWeddingDate(weddingDate)}
          </p>
        </div>

        {/* Main Venue Proclamation */}
        {venue && (
          <div className="max-w-md mx-auto my-6 p-4 rounded-xl bg-royal-ivory-card border border-royal-gold-400/40 shadow-sm text-center">
            <div className="inline-flex p-2 rounded-full bg-royal-gold-100 text-royal-gold-800 mb-2">
              <MapPin className="w-5 h-5 text-royal-gold-600" />
            </div>
            <h4 className="font-serif text-lg font-bold text-royal-maroon-800">
              {venue.name}
            </h4>
            {venue.address && (
              <p className="text-xs text-royal-brown-600 mt-1 max-w-sm mx-auto">
                {venue.address}
              </p>
            )}
            {venue.mapUrl && (
              <div className="mt-3">
                <a
                  href={venue.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-royal-maroon-700 hover:text-royal-maroon-900 underline"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1" />
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        )}

        {/* Photo Reel */}
        {photos && photos.length > 0 && (
          <div className="mt-8 pt-8 border-t border-royal-gold-500/30">
            <span className="text-xs uppercase tracking-widest text-royal-gold-700 font-bold block mb-4">
              Glimpses of Togetherness
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {photos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-royal-gold-400 shadow-royal hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={photoUrl}
                    alt={`Couple photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
