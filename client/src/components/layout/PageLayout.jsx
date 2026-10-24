import React from 'react';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { useLenis } from '../../hooks/useLenis.js';

export const PageLayout = ({ children, showHeader = true, showFooter = true }) => {
  useLenis();

  return (
    <div className="min-h-screen flex flex-col bg-mandap-pattern text-royal-brown-800 antialiased selection:bg-royal-gold-200 selection:text-royal-maroon-900">
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
