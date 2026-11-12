import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  RotateCcw,
  ExternalLink,
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

  const loadSectionData = () => {
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
  };

  useEffect(() => {
    loadSectionData();
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
      setTimeout(() => setSaveSuccess(''), 4500);
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
      <div className="p-5 bg-white border border-floral-gold/30 rounded-2xl shadow-xs">
        <h2 className="font-serif text-2xl font-bold text-floral-burgundy">
          Homepage Content CMS
        </h2>
        <p className="text-xs text-floral-brown/80 mt-0.5">
          Modify headlines, subheadings, call-to-actions, testimonials, and FAQs live on the public website.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t)} />

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl flex items-center gap-2 font-medium shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-16 text-center bg-white border border-floral-gold/20 rounded-2xl">
          <Loader2 className="w-8 h-8 text-floral-gold animate-spin mx-auto mb-2" />
          <p className="text-xs text-floral-brown/70 font-medium">Loading section data from server...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Hero Form */}
          {activeTab === 'hero' && (
            <Card ornate={false} className="p-6 bg-white border border-floral-gold/30 shadow-xs rounded-2xl space-y-4">
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
            <Card ornate={false} className="p-6 bg-white border border-floral-gold/30 shadow-xs rounded-2xl space-y-4">
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

              <div className="space-y-4 pt-4 border-t border-floral-gold/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-floral-burgundy">
                  Configured FAQs ({faqsData.items?.length || 0})
                </h4>

                {faqsData.items?.map((faq, i) => (
                  <div key={i} className="p-4 bg-floral-blush/30 border border-floral-gold/25 rounded-xl space-y-2">
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
            <Card ornate={false} className="p-6 bg-white border border-floral-gold/30 shadow-xs rounded-2xl space-y-4">
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

              <div className="space-y-4 pt-4 border-t border-floral-gold/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-floral-burgundy">
                  Configured Testimonials ({testimonialsData.items?.length || 0})
                </h4>

                {testimonialsData.items?.map((t, i) => (
                  <div key={i} className="p-4 bg-floral-blush/30 border border-floral-gold/25 rounded-xl space-y-3">
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

          {/* Form Action Controls: Save, Cancel/Reset, Live Preview */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={loadSectionData}
                disabled={isSaving}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Cancel / Discard Changes</span>
              </Button>

              <Link
                to={activeTab === 'hero' ? '/' : `/#${activeTab}`}
                target="_blank"
                rel="noreferrer"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-floral-gold/40 text-xs font-semibold text-floral-burgundy hover:bg-floral-blush transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-floral-gold" />
                  <span>Preview Public Section</span>
                </button>
              </Link>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="md"
              isLoading={isSaving}
              className="font-bold text-xs text-[#260209] shadow-gold-glow"
            >
              <Save className="w-4 h-4 mr-2 text-[#260209]" />
              <span>Save Section Changes</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
