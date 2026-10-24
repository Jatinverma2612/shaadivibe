import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { weddingDetailsSchema } from '../../utils/validationSchemas.js';
import { useCustomizationStore } from '../../store/customizationStore.js';
import { Input, Textarea } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { FloralDivider } from '../../components/common/Motifs.jsx';

export const Step1Details = ({ onNext }) => {
  const store = useCustomizationStore();
  const [editingEventId, setEditingEventId] = useState(null);

  // New ceremony state for adding events
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    icon: 'Calendar',
  });
  const [eventError, setEventError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(weddingDetailsSchema),
    defaultValues: {
      brideName: store.brideName,
      groomName: store.groomName,
      weddingDate: store.weddingDate,
      weddingTime: store.weddingTime,
      language: store.language,
      tagline: store.tagline,
      familyMessage: store.familyMessage,
      venueName: store.venue.name,
      venueAddress: store.venue.address,
      venueMapUrl: store.venue.mapUrl,
    },
  });

  const onSubmit = (data) => {
    store.updateDetails({
      brideName: data.brideName,
      groomName: data.groomName,
      weddingDate: data.weddingDate,
      weddingTime: data.weddingTime,
      language: data.language,
      tagline: data.tagline,
      familyMessage: data.familyMessage,
      venue: {
        name: data.venueName,
        address: data.venueAddress,
        mapUrl: data.venueMapUrl,
      },
    });
    onNext();
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date.trim() || !newEvent.time.trim()) {
      setEventError('Please enter Ceremony Title, Date, and Time.');
      return;
    }
    store.addEvent(newEvent);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      icon: 'Calendar',
    });
    setEventError('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* 1. Couple & Auspicious Date */}
      <Card ornate={false} className="p-6 sm:p-8 bg-royal-ivory-card border-2 border-royal-gold-400/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-royal-gold-500/20">
          <Heart className="w-5 h-5 text-royal-maroon-700" />
          <h3 className="font-serif text-lg font-bold text-royal-maroon-800">
            Bride, Groom & Auspicious Timing
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Bride's Name"
            placeholder="e.g. Priya Sharma"
            required
            {...register('brideName')}
            error={errors.brideName?.message}
          />
          <Input
            label="Groom's Name"
            placeholder="e.g. Rohan Mehra"
            required
            {...register('groomName')}
            error={errors.groomName?.message}
          />

          <Input
            label="Auspicious Wedding Date"
            type="date"
            required
            {...register('weddingDate')}
            error={errors.weddingDate?.message}
          />
          <Input
            label="Auspicious Muhurat / Time"
            placeholder="e.g. 07:30 PM onwards"
            {...register('weddingTime')}
            error={errors.weddingTime?.message}
          />

          <Input
            label="Romantic Tagline"
            placeholder="e.g. Two Souls, One Sacred Destiny"
            className="sm:col-span-2"
            {...register('tagline')}
            error={errors.tagline?.message}
          />
        </div>
      </Card>

      {/* 2. Family Invitation Note & Venue */}
      <Card ornate={false} className="p-6 sm:p-8 bg-royal-ivory-card border-2 border-royal-gold-400/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-royal-gold-500/20">
          <MapPin className="w-5 h-5 text-royal-gold-600" />
          <h3 className="font-serif text-lg font-bold text-royal-maroon-800">
            Family Invitation Note & Venue
          </h3>
        </div>

        <div className="space-y-5">
          <Textarea
            label="Family Invitation Message"
            rows={3}
            placeholder="Together with their families, we cordially invite you..."
            {...register('familyMessage')}
            error={errors.familyMessage?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Venue Name"
              placeholder="e.g. The Oberoi Udaivilas Palace"
              required
              {...register('venueName')}
              error={errors.venueName?.message}
            />
            <Input
              label="Google Maps Location URL (Optional)"
              placeholder="https://maps.google.com/?q=..."
              {...register('venueMapUrl')}
              error={errors.venueMapUrl?.message}
            />
          </div>

          <Input
            label="Complete Venue Address"
            placeholder="Haridas Ji Ki Magri, Udaipur, Rajasthan"
            {...register('venueAddress')}
            error={errors.venueAddress?.message}
          />
        </div>
      </Card>

      {/* 3. Dynamic Wedding Event Itinerary Editor */}
      <Card ornate={false} className="p-6 sm:p-8 bg-royal-ivory-card border-2 border-royal-gold-400/50 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-royal-gold-500/20">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-royal-maroon-700" />
            <h3 className="font-serif text-lg font-bold text-royal-maroon-800">
              Wedding Ceremony Itinerary
            </h3>
          </div>
          <span className="text-xs font-semibold text-royal-gold-800 bg-royal-gold-100 px-2.5 py-1 rounded-full">
            {store.events.length} Ceremonies
          </span>
        </div>

        <p className="text-xs text-royal-brown-600 mb-6">
          Customize ceremonies like Haldi, Mehendi, Sangeet, Baraat, Pheras, or Reception. Guests will view these on an animated timeline.
        </p>

        {/* Existing Events List */}
        <div className="space-y-3 mb-6">
          {store.events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="flex items-center justify-between p-3.5 bg-royal-ivory-warm/60 border border-royal-gold-300/60 rounded-xl"
            >
              <div className="space-y-0.5">
                <span className="font-serif font-bold text-royal-maroon-800 text-sm block">
                  {evt.title}
                </span>
                <span className="text-xs text-royal-brown-600">
                  {evt.date} • {evt.time} {evt.venue && `• ${evt.venue}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => store.removeEvent(evt.id)}
                className="p-1.5 text-royal-brown-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Ceremony"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Ceremony Box */}
        <div className="p-4 bg-royal-gold-50/50 border border-dashed border-royal-gold-400 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-royal-maroon-800">
            Add Another Auspicious Ceremony
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Ceremony Title (e.g. Sangeet)"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-royal-gold-300 bg-white"
            />
            <input
              type="text"
              placeholder="Date / Day (e.g. Day 1 — Evening)"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-royal-gold-300 bg-white"
            />
            <input
              type="text"
              placeholder="Timing (e.g. 07:00 PM)"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-royal-gold-300 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ceremony Venue (e.g. Lake Deck Pavilion)"
              value={newEvent.venue}
              onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-royal-gold-300 bg-white"
            />
            <input
              type="text"
              placeholder="Brief Ritual Description (Optional)"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-royal-gold-300 bg-white"
            />
          </div>

          {eventError && <p className="text-xs text-red-600 font-medium">{eventError}</p>}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEvent}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Ceremony to Itinerary
          </Button>
        </div>
      </Card>

      {/* Navigation Next */}
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="gold" size="lg" className="w-full sm:w-auto">
          <span>Continue to Photos (Step 2)</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  );
};
