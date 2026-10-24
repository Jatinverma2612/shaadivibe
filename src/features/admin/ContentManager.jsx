import React, { useState, useEffect } from 'react';
import { fetchSiteContent, updateSiteContent } from '../../services/api.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input, Textarea } from '../../components/common/Input.jsx';
import { Tabs } from '../../components/common/Tabs.jsx';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layout,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

export const ContentManager = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Hero section state
  const [heroData, setHeroData] = useState({
    badge: 'India’s Premier Digital Wedding Invitation Suite',
    headline: 'Craft Unforgettable Royal Indian Wedding Invitations',
    subheadline:
      'Celebrate sacred vows with 3D animated envelope reveals, personalized ceremony timelines, interactive cards, and live auspicious countdowns.',
    primaryCtaText: 'Browse Royal Themes',
    secondaryCtaText: 'Experience Live Demo',
  });

  // FAQs state
  const [faqsData, setFaqsData] = useState({
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about creating your royal digital wedding invitation.',
    items: [],
  });

  // Testimonials state
  const [testimonialsData, setTestimonialsData] = useState({
    title: 'Cherished by Couples Across the Globe',
    subtitle: 'Real stories from brides, grooms, and families who invited their loved ones with ShaadiVibe.',
    items: [],
  });

  useEffect(() => {
    setIsLoading(true);
    setSaveSuccess('');
    setSaveError('');

    fetchSiteContent(activeTab)
      .then((data) => {
        if (activeTab === 'hero') setHeroData((prev) => ({ ...prev, ...data }));
        if (activeTab === 'faqs') setFaqsData((prev) => ({ ...prev, ...data }));
        if (activeTab === 'testimonials') setTestimonialsData((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => {
        setSaveError(`Failed to load ${activeTab} content: ${err.message}`);
      })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      let payload = {};
      if (activeTab === 'hero') payload = heroData;
      if (activeTab === 'faqs') payload = faqsData;
      if (activeTab === 'testimonials') payload = testimonialsData;

      const res = await updateSiteContent(activeTab, payload);
      setSaveSuccess(res.message || `Homepage section "${activeTab}" updated successfully!`);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update content on server.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero Banner Section' },
    { id: 'faqs', label: 'FAQs Section' },
    { id: 'testimonials', label: 'Testimonials Section' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-serif text-2xl font-bold text-royal-maroon-800">
          Homepage Content CMS
        </h2>
        <p className="text-xs text-royal-brown-600 mt-0.5">
          Edit headlines, subheadings, call-to-actions, testimonials, and FAQs live on the public website.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t)} />

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-royal-gold-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-royal-brown-600">Loading section data...</p>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {/* Hero Form */}
          {activeTab === 'hero' && (
            <Card ornate={false} className="p-6 bg-royal-ivory-card border border-royal-gold-400/40 space-y-4">
              <Input
                label="Hero Tagline Badge"
                value={heroData.badge || ''}
                onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
              />

              <Input
                label="Primary Hero Headline"
                value={heroData.headline || ''}
                onChange={(e) => setHeroData({ ...heroData, headline: e.target.value })}
                required
              />

              <Textarea
                label="Hero Subheadline"
                rows={3}
                value={heroData.subheadline || ''}
                onChange={(e) => setHeroData({ ...heroData, subheadline: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary CTA Button Label"
                  value={heroData.primaryCtaText || ''}
                  onChange={(e) => setHeroData({ ...heroData, primaryCtaText: e.target.value })}
                />
                <Input
                  label="Secondary CTA Button Label"
                  value={heroData.secondaryCtaText || ''}
                  onChange={(e) => setHeroData({ ...heroData, secondaryCtaText: e.target.value })}
                />
              </div>
            </Card>
          )}

          {/* FAQs Form */}
          {activeTab === 'faqs' && (
            <Card ornate={false} className="p-6 bg-royal-ivory-card border border-royal-gold-400/40 space-y-4">
              <Input
                label="Section Heading"
                value={faqsData.title || ''}
                onChange={(e) => setFaqsData({ ...faqsData, title: e.target.value })}
              />
              <Input
                label="Section Subheading"
                value={faqsData.subtitle || ''}
                onChange={(e) => setFaqsData({ ...faqsData, subtitle: e.target.value })}
              />

              <div className="space-y-4 pt-4 border-t border-royal-gold-300/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-royal-maroon-800">
                  Configured FAQs ({faqsData.items?.length || 0})
                </h4>

                {faqsData.items?.map((faq, i) => (
                  <div key={i} className="p-4 bg-royal-ivory-warm/40 border border-royal-gold-300 rounded-xl space-y-2">
                    <Input
                      label={`Question ${i + 1}`}
                      value={faq.question}
                      onChange={(e) => {
                        const next = [...faqsData.items];
                        next[i].question = e.target.value;
                        setFaqsData({ ...faqsData, items: next });
                      }}
                    />
                    <Textarea
                      label="Answer"
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const next = [...faqsData.items];
                        next[i].answer = e.target.value;
                        setFaqsData({ ...faqsData, items: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Testimonials Form */}
          {activeTab === 'testimonials' && (
            <Card ornate={false} className="p-6 bg-royal-ivory-card border border-royal-gold-400/40 space-y-4">
              <Input
                label="Section Heading"
                value={testimonialsData.title || ''}
                onChange={(e) => setTestimonialsData({ ...testimonialsData, title: e.target.value })}
              />
              <Input
                label="Section Subheading"
                value={testimonialsData.subtitle || ''}
                onChange={(e) => setTestimonialsData({ ...testimonialsData, subtitle: e.target.value })}
              />

              <div className="space-y-4 pt-4 border-t border-royal-gold-300/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-royal-maroon-800">
                  Configured Testimonials ({testimonialsData.items?.length || 0})
                </h4>

                {testimonialsData.items?.map((t, i) => (
                  <div key={i} className="p-4 bg-royal-ivory-warm/40 border border-royal-gold-300 rounded-xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="Couple Names"
                        value={t.couple}
                        onChange={(e) => {
                          const next = [...testimonialsData.items];
                          next[i].couple = e.target.value;
                          setTestimonialsData({ ...testimonialsData, items: next });
                        }}
                      />
                      <Input
                        label="Cities"
                        value={t.city}
                        onChange={(e) => {
                          const next = [...testimonialsData.items];
                          next[i].city = e.target.value;
                          setTestimonialsData({ ...testimonialsData, items: next });
                        }}
                      />
                      <Input
                        label="Theme"
                        value={t.theme}
                        onChange={(e) => {
                          const next = [...testimonialsData.items];
                          next[i].theme = e.target.value;
                          setTestimonialsData({ ...testimonialsData, items: next });
                        }}
                      />
                    </div>
                    <Textarea
                      label="Quote"
                      rows={2}
                      value={t.quote}
                      onChange={(e) => {
                        const next = [...testimonialsData.items];
                        next[i].quote = e.target.value;
                        setTestimonialsData({ ...testimonialsData, items: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="gold" size="lg" isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Section Updates
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
