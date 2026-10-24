import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomizationStore } from '../../store/customizationStore.js';
import { fetchThemeBySlug } from '../../services/api.js';
import { Step1Details } from './Step1Details.jsx';
import { Step2Photos } from './Step2Photos.jsx';
import { Step3Preview } from './Step3Preview.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Sparkles, Check, ArrowLeft, Heart, Image as ImageIcon, Eye } from 'lucide-react';

export const CustomizationWizard = () => {
  const { themeId } = useParams();
  const store = useCustomizationStore();

  useEffect(() => {
    // If a theme was passed in URL, load its defaults
    if (themeId) {
      fetchThemeBySlug(themeId)
        .then((theme) => {
          if (theme) store.setSelectedTheme(theme);
        })
        .catch(() => {});
    }
  }, [themeId]);

  const steps = [
    { number: 1, title: 'Details & Itinerary', icon: Heart },
    { number: 2, title: 'Couple Photos', icon: ImageIcon },
    { number: 3, title: 'Final Preview', icon: Eye },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb & Header */}
      <div className="text-center mb-8">
        <Link
          to="/themes"
          className="inline-flex items-center text-xs font-semibold text-royal-gold-700 hover:text-royal-maroon-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Theme Gallery</span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-maroon-800 tracking-wide">
          Customize Your Royal Invitation
        </h1>
        <p className="text-xs sm:text-sm text-royal-brown-600 max-w-lg mx-auto mt-2">
          Personalize every ritual, timing, venue, and romantic photograph with real-time preview.
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
                  // Only allow clicking past completed steps or current
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
