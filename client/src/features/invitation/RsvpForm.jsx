import React, { useState } from 'react';
import { submitRsvp } from '../../services/api.js';
import { Button } from '../../components/common/Button.jsx';
import {
  Heart,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  Users,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const RsvpForm = ({ invitation }) => {
  const events = invitation?.events || [];
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || events[0]?._id || '');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [attendance, setAttendance] = useState('attending');
  const [guestCount, setGuestCount] = useState(1);
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedEventId) {
      setError('Please select a ceremony.');
      return;
    }

    if (!guestName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!guestEmail.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitRsvp({
        invitationSlug: invitation.slug,
        ceremonyId: selectedEventId,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        attendance,
        guestCount: attendance === 'declined' ? 0 : Number(guestCount),
        dietaryPreferences: dietaryPreferences.trim(),
        message: message.trim(),
      });

      setSuccess({
        message: res.message || 'Your RSVP has been graciously recorded!',
        attendance,
        ceremony: res.data?.ceremonyTitle || 'Ceremony',
      });
    } catch (err) {
      console.error('RSVP submission error:', err);
      setError(err.message || 'Failed to submit RSVP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForAnother = () => {
    setSuccess(null);
    setError(null);
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="relative rounded-2xl bg-royal-ivory-card border-2 border-royal-gold-500/40 shadow-royal-lg p-6 sm:p-10 backdrop-blur-md">
        {/* Decorative corner flourishes */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-royal-gold-500/60" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-royal-gold-500/60" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-royal-gold-500/60" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-royal-gold-500/60" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-royal-gold-500/10 border border-royal-gold-500/30 text-royal-gold-700 mb-3 shadow-inner">
            <Sparkles className="w-6 h-6 text-royal-gold-600" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-maroon-800 tracking-wide">
            Celebrate With Us
          </h2>
          <p className="text-xs uppercase tracking-widest text-royal-gold-700 mt-1 font-medium">
            RSVP for the Auspicious Occasion
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-royal-gold-500 to-transparent mx-auto mt-3" />
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 border border-emerald-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-serif text-xl font-bold text-royal-maroon-800 mb-2">
              Shukriya! Thank You
            </h3>
            <p className="text-sm text-royal-brown-700 max-w-md mx-auto mb-4">
              {success.message}
            </p>
            <div className="inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-royal-gold-50 border border-royal-gold-300 text-royal-gold-800 mb-6">
              Status:{' '}
              {success.attendance === 'attending'
                ? 'Joyfully Attending'
                : success.attendance === 'declined'
                ? 'Regretfully Unable'
                : 'Tentative / Maybe'}
            </div>
            <div className="block">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetForAnother}
                className="text-xs border-royal-gold-400 text-royal-maroon-800 hover:bg-royal-gold-50"
              >
                Respond for Another Ceremony or Guest
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Ceremony */}
            <div>
              <label className="block text-xs font-semibold text-royal-maroon-900 mb-1.5 uppercase tracking-wider">
                Select Ceremony <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 appearance-none cursor-pointer"
                  required
                >
                  {events.map((ev) => {
                    const eventId = ev.id || ev._id;
                    return (
                      <option key={eventId} value={eventId}>
                        {ev.title} — {ev.date} ({ev.time})
                      </option>
                    );
                  })}
                </select>
                <Calendar className="w-4 h-4 text-royal-gold-700 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Attendance Choice */}
            <div>
              <label className="block text-xs font-semibold text-royal-maroon-900 mb-1.5 uppercase tracking-wider">
                Will You Attend? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { id: 'attending', label: 'Joyfully Accept' },
                  { id: 'declined', label: 'Regretfully Decline' },
                  { id: 'maybe', label: 'Unsure / Maybe' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAttendance(opt.id)}
                    className={`py-2 px-2 text-xs sm:text-sm font-medium rounded-lg border transition-all text-center ${
                      attendance === opt.id
                        ? 'bg-royal-maroon-800 border-royal-maroon-900 text-royal-gold-100 shadow-md font-semibold'
                        : 'bg-white/80 border-royal-gold-300 text-royal-brown-700 hover:bg-royal-gold-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-royal-maroon-900 mb-1 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50"
                    required
                  />
                  <User className="w-4 h-4 text-royal-gold-600 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-royal-maroon-900 mb-1 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50"
                    required
                  />
                  <Mail className="w-4 h-4 text-royal-gold-600 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Phone & Headcount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-royal-maroon-900 mb-1 uppercase tracking-wider">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50"
                  />
                  <Phone className="w-4 h-4 text-royal-gold-600 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {attendance !== 'declined' ? (
                <div>
                  <label className="block text-xs font-semibold text-royal-maroon-900 mb-1 uppercase tracking-wider">
                    Number of Guests
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50"
                    />
                    <Users className="w-4 h-4 text-royal-gold-600 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-xs text-royal-brown-600 pt-6">
                  <span>We will miss your auspicious presence!</span>
                </div>
              )}
            </div>

            {/* Dietary Preferences & Wishes */}
            <div>
              <label className="block text-xs font-semibold text-royal-maroon-900 mb-1 uppercase tracking-wider">
                Dietary Preferences or Food Allergies (Optional)
              </label>
              <input
                type="text"
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
                placeholder="e.g. Vegetarian, Jain, Vegan, Nut allergy"
                className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-royal-maroon-900 mb-1 uppercase tracking-wider">
                Warm Wishes for the Couple (Optional)
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a heartfelt message or blessing..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 resize-none"
                />
                <MessageSquare className="w-4 h-4 text-royal-gold-600 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full py-3 shadow-royal-md flex items-center justify-center gap-2 text-sm font-semibold tracking-wider uppercase"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-royal-gold-400" />
                    Recording RSVP...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 text-royal-gold-400 fill-royal-gold-400" />
                    Send RSVP Response
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

