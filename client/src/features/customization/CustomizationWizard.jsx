import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useCustomizationStore } from '../../store/customizationStore.js';
import { fetchThemeBySlug, fetchInvitationById } from '../../services/api.js';
import { Step1Details } from './Step1Details.jsx';
import { Step2Photos } from './Step2Photos.jsx';
import { Step3Preview } from './Step3Preview.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Sparkles, Check, ArrowLeft, Heart, Image as ImageIcon, Eye, FileText, CheckCircle2 } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb & Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link
            to="/themes"
            className="inline-flex items-center text-xs font-semibold text-royal-gold-700 hover:text-royal-maroon-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Theme Gallery</span>
          </Link>
          <span className="text-royal-gold-300">•</span>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-semibold text-royal-gold-700 hover:text-royal-maroon-700 transition-colors"
          >
            <span>My Dashboard</span>
          </Link>
        </div>

        {store.invitationId && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-gold-100 border border-royal-gold-400 text-[11px] font-bold text-royal-maroon-800 mb-3 shadow-sm">
            <FileText className="w-3.5 h-3.5 text-royal-gold-700" />
            <span>Editing Saved Invitation • Status: {store.status === 'published' ? 'Published' : 'Draft'}</span>
          </div>
        )}

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-maroon-800 tracking-wide">
          {store.invitationId ? 'Update Your Royal Invitation' : 'Customize Your Royal Invitation'}
        </h1>
        <p className="text-xs sm:text-sm text-royal-brown-600 max-w-lg mx-auto mt-2">
          Personalize every ritual, timing, venue, and romantic photograph with real-time preview and server-side draft preservation.
        </p>
        <FloralDivider className="w-36 h-3 text-royal-gold-500 mx-auto mt-3" />
      </div>

      {/* 3-Step Wizard Indicator (NO MUSIC STEP) */}
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-royal-gold-300/60 z-0" />

          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = store.activeStep > s.number;
            const isCurrent = store.activeStep === s.number;

            return (
              <div
                key={s.number}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
                onClick={() => {
                  if (s.number <= store.activeStep || isCompleted) {
                    store.setActiveStep(s.number);
                  }
                }}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                    isCompleted
                      ? 'bg-royal-maroon-700 text-royal-gold-200 border-royal-gold-400 shadow-md'
                      : isCurrent
                      ? 'bg-royal-gold-500 text-royal-brown-950 border-royal-maroon-700 shadow-gold-glow scale-110'
                      : 'bg-royal-ivory-card text-royal-brown-400 border-royal-gold-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
                </div>

                <span
                  className={`text-xs font-semibold tracking-wider uppercase mt-2 select-none ${
                    isCurrent
                      ? 'text-royal-maroon-800 font-bold'
                      : isCompleted
                      ? 'text-royal-gold-800'
                      : 'text-royal-brown-400'
                  }`}
                >
                  Step {s.number}: {s.title}
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
