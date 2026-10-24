import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchInvitationBySlug } from '../../services/api.js';
import { FallingPetals } from './FallingPetals.jsx';
import { EnvelopeOpening } from './EnvelopeOpening.jsx';
import { CountdownTimer } from './CountdownTimer.jsx';
import { InteractiveCards } from './InteractiveCards.jsx';
import { YouAreInvitedCard } from './YouAreInvitedCard.jsx';
import { EventTimeline } from './EventTimeline.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Share2, Check, ArrowLeft, Sparkles, Loader2, Heart } from 'lucide-react';
import { sampleInvitation } from '../../../server/controllers/invitationController.js';

export const InvitationRenderer = ({ customInvitation = null }) => {
  const { slug } = useParams();
  const [invitation, setInvitation] = useState(customInvitation);
  const [isLoading, setIsLoading] = useState(!customInvitation);
  const [error, setError] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (customInvitation) {
      setInvitation(customInvitation);
      setIsLoading(false);
      return;
    }

    const loadInvite = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchInvitationBySlug(slug || 'priya-and-rohan');
        setInvitation(data);
      } catch (err) {
        console.error('Failed to load invitation:', err);
        setError(err.message || 'Invitation not found');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvite();
  }, [slug, customInvitation]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mandap-pattern flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-royal-gold-600 animate-spin mb-4" />
        <h3 className="font-serif text-xl font-bold text-royal-maroon-800">
          Unfolding Royal Invitation...
        </h3>
        <p className="text-xs uppercase tracking-widest text-royal-gold-700 mt-1">
          ShaadiVibe Royal Experience
        </p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-mandap-pattern flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-royal-maroon-100 border border-royal-maroon-300 flex items-center justify-center text-royal-maroon-700 mb-4 mx-auto">
          <Heart className="w-8 h-8 opacity-60" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-royal-maroon-800 mb-2">
          Invitation Not Found
        </h2>
        <p className="text-sm text-royal-brown-600 max-w-md mx-auto mb-6">
          The auspicious wedding invitation link you followed may have expired, or the unique slug is incorrect.
        </p>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="outline" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
          <Link to="/invite/priya-and-rohan">
            <Button variant="gold" size="md">
              View Sample Wedding
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mandap-pattern text-royal-brown-800 relative pb-24 overflow-x-hidden">
      {/* Ambient Falling Flower Petals */}
      <FallingPetals count={16} />

      {/* Top Floating Bar for Guests & Sharing */}
      <div className="sticky top-0 z-30 bg-royal-ivory-card/85 backdrop-blur-md border-b border-royal-gold-500/20 py-2.5 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif text-sm font-bold tracking-wider text-royal-maroon-800">
              Shaadi<span className="text-royal-gold-600">Vibe</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="text-xs bg-white/80"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Copied Link!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 mr-1 text-royal-gold-700" />
                  Share with Family
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Opening Sequence: 3D Royal Envelope with Wax Seal */}
      <section className="pt-6 pb-4">
        <EnvelopeOpening invitation={invitation} />
      </section>

      {/* 2. Live Auspicious Countdown */}
      <section>
        <CountdownTimer
          weddingDate={invitation.weddingDate}
          brideName={invitation.brideName}
          groomName={invitation.groomName}
        />
      </section>

      {/* 3. Three Interactive Decorative Cards */}
      <section>
        <InteractiveCards cards={invitation.interactiveCards} />
      </section>

      {/* 4. Second Interactive Card: "You Are Cordially Invited" Message */}
      <section>
        <YouAreInvitedCard invitation={invitation} />
      </section>

      {/* 5. Wedding Ceremony Timeline */}
      <section>
        <EventTimeline events={invitation.events} />
      </section>

      {/* Floating Bottom Action Badge for Visitors */}
      <div className="fixed bottom-4 right-4 z-40">
        <Link to="/themes">
          <Button
            variant="primary"
            size="md"
            className="shadow-royal-lg hover:shadow-gold-glow flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-royal-gold-400" />
            <span>Create Your Invite</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
