import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useCustomizationStore } from '../../store/customizationStore.js';
import { fetchThemeBySlug, fetchInvitationById } from '../../services/api.js';
import { Step1Details } from './Step1Details.jsx';
import { Step2Photos } from './Step2Photos.jsx';
import { Step3Preview } from './Step3Preview.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Check, ArrowLeft, Heart, Image as ImageIcon, Eye, FileText } from 'lucide-react';

export const CustomizationWizard = () => {
  const { themeId } = useParams();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const store = useCustomizationStore();
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  useEffect(() => {
    // If editing an existing draft
    if (editId) {
      setIsLoadingDraft(true);
      fetchInvitationById(editId)
        .then((inv) => {
          if (inv) store.loadInvitation(inv);
        })
        .catch((err) => {
          console.warn('[Wizard] Could not load draft:', err.message);
        })
        .finally(() => {
          setIsLoadingDraft(false);
        });
    } else if (themeId) {
      // If a theme was passed in URL and not loading an edit draft
      fetchThemeBySlug(themeId)
        .then((theme) => {
          if (theme) store.setSelectedTheme(theme);
        })
        .catch(() => {});
    }
  }, [themeId, editId]);

  const steps = [
    { number: 1, title: 'Details & Itinerary', icon: Heart },
    { number: 2, title: 'Couple Photos', icon: ImageIcon },
    { number: 3, title: 'Final Preview', icon: Eye },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <Link
            to="/themes"
            className="inline-flex items-center text-xs font-semibold text-floral-gold hover:text-floral-burgundy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Theme Gallery</span>
          </Link>
          <span className="text-floral-gold/60">•</span>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-semibold text-floral-gold hover:text-floral-burgundy transition-colors"
          >
            <span>My Dashboard</span>
          </Link>
        </div>

        {store.invitationId && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-floral-blush border border-royal-rose/30 text-[11px] font-bold text-floral-burgundy mb-2.5 shadow-sm">
            <FileText className="w-3.5 h-3.5 text-floral-burgundy" />
            <span>Editing Saved Invitation • Status: {store.status === 'published' ? 'Published' : 'Draft'}</span>
          </div>
        )}

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-floral-burgundy tracking-wide">
          {store.invitationId ? 'Update Your Royal Invitation' : 'Customize Your Royal Invitation'}
        </h1>
        <p className="text-xs sm:text-sm text-floral-brown/85 max-w-lg mx-auto mt-2 leading-relaxed">
          Personalize every ritual, timing, venue, and romantic photograph with real-time preview and server-side draft preservation.
        </p>
        <FloralDivider className="w-36 h-3 text-floral-gold mx-auto mt-3" />
      </div>

      {/* 3-Step Wizard Indicator */}
      <div className="mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-0.5 bg-floral-gold/30 z-0" />

          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = store.activeStep > s.number;
            const isCurrent = store.activeStep === s.number;

            return (
              <div
                key={s.number}
                className="relative z-10 flex flex-col items-center cursor-pointer group flex-1"
                onClick={() => {
                  if (s.number <= store.activeStep || isCompleted) {
                    store.setActiveStep(s.number);
                  }
                }}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 border-2 ${
                    isCompleted
                      ? 'bg-floral-burgundy text-white border-floral-gold shadow-md'
                      : isCurrent
                      ? 'bg-gradient-to-r from-royal-gold-600 to-royal-gold-500 text-floral-brown border-floral-burgundy shadow-gold-glow scale-110'
                      : 'bg-white text-floral-brown/40 border-floral-gold/30'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>

                <span
                  className={`text-[10px] sm:text-xs font-semibold tracking-wider uppercase mt-2 text-center select-none ${
                    isCurrent
                      ? 'text-floral-burgundy font-bold'
                      : isCompleted
                      ? 'text-floral-gold'
                      : 'text-floral-brown/40'
                  }`}
                >
                  <span className="hidden sm:inline">Step {s.number}: </span>{s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="transition-all duration-300">
        {store.activeStep === 1 && (
          <Step1Details onNext={() => store.setActiveStep(2)} />
        )}

        {store.activeStep === 2 && (
          <Step2Photos
            onNext={() => store.setActiveStep(3)}
            onPrev={() => store.setActiveStep(1)}
          />
        )}

        {store.activeStep === 3 && (
          <Step3Preview
            onPrev={() => store.setActiveStep(2)}
            onGoToStep={(stepNum) => store.setActiveStep(stepNum)}
          />
        )}
      </div>
    </div>
  );
};
