import React, { useState, useEffect } from 'react';
import { HeroSection } from './HeroSection.jsx';
import { FeaturesSection } from './FeaturesSection.jsx';
import { TrendingThemes } from './TrendingThemes.jsx';
import { HowItWorks } from './HowItWorks.jsx';
import { WhyChooseUs } from './WhyChooseUs.jsx';
import { TestimonialsSection } from './TestimonialsSection.jsx';
import { CtaBanner } from './CtaBanner.jsx';
import { FaqSection } from './FaqSection.jsx';
import { fetchSiteContent } from '../../services/api.js';

export const HomePage = () => {
  const [heroContent, setHeroContent] = useState(null);
  const [featuresContent, setFeaturesContent] = useState(null);
  const [testimonialsContent, setTestimonialsContent] = useState(null);
  const [faqsContent, setFaqsContent] = useState(null);

  useEffect(() => {
    fetchSiteContent('hero').then(setHeroContent).catch(() => {});
    fetchSiteContent('features').then(setFeaturesContent).catch(() => {});
    fetchSiteContent('testimonials').then(setTestimonialsContent).catch(() => {});
    fetchSiteContent('faqs').then(setFaqsContent).catch(() => {});
  }, []);

  return (
    <div className="space-y-0">
      <HeroSection content={heroContent} />
      <FeaturesSection content={featuresContent} />
      <TrendingThemes />
      <HowItWorks />
      <WhyChooseUs />
      <TestimonialsSection content={testimonialsContent} />
      <CtaBanner />
      <FaqSection content={faqsContent} />
    </div>
  );
};
