import React from 'react';
import { OrnateCorner } from './Motifs.jsx';

export const Card = ({
  children,
  className = '',
  ornate = true,
  variant = 'paper', // 'paper' | 'maroon' | 'flat'
  ...props
}) => {
  const variantStyles = {
    paper: 'bg-royal-ivory-card text-royal-brown-800 border border-royal-gold-500/30 shadow-royal',
    maroon: 'bg-royal-maroon-900 text-royal-ivory-DEFAULT border border-royal-gold-500/40 shadow-royal-lg',
    flat: 'bg-royal-ivory-warm text-royal-brown-800 border border-royal-ivory-border',
  }[variant] || 'bg-royal-ivory-card text-royal-brown-800';

  return (
    <div
      className={`relative rounded-xl p-6 transition-all duration-300 ${variantStyles} ${
        ornate ? 'ornate-border' : ''
      } ${className}`}
      {...props}
    >
      {ornate && (
        <>
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <OrnateCorner position="top-left" className="w-5 h-5 text-royal-gold-500/80" />
          </div>
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            <OrnateCorner position="top-right" className="w-5 h-5 text-royal-gold-500/80" />
          </div>
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <OrnateCorner position="bottom-left" className="w-5 h-5 text-royal-gold-500/80" />
          </div>
          <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
            <OrnateCorner position="bottom-right" className="w-5 h-5 text-royal-gold-500/80" />
          </div>
        </>
      )}
      {children}
    </div>
  );
};
