import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { GlobalPetals } from '../common/GlobalPetals.jsx';
import { useLenis } from '../../hooks/useLenis.js';

export const PageLayout = ({ children, showHeader = true, showFooter = true }) => {
  useLenis();
  const location = useLocation();

  // Functional screens that should remain calm and readable without petals
  const isFunctionalScreen =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-mandap-pattern text-floral-brown antialiased selection:bg-royal-rose-light selection:text-floral-burgundy relative overflow-x-hidden">
      {/* Ambient Autumn Leaves for Public Website */}
      {!isFunctionalScreen && <GlobalPetals count={20} />}

      {showHeader && <Header />}
      <main className="flex-1 relative">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
