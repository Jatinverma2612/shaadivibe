import React from 'react';
import { OrnateCorner } from './Motifs.jsx';

export const Card = ({
  children,
  className = '',
  ornate = true,
  variant = 'paper', // 'paper' | 'blush' | 'maroon' | 'flat'
  ...props
}) => {
  const variantStyles = {
    paper: 'bg-white text-floral-brown border border-floral-gold/30 shadow-sm',
    blush: 'bg-floral-blush/70 text-floral-brown border border-royal-rose/30 shadow-sm',
    maroon: 'bg-gradient-to-br from-royal-maroon-900 to-royal-maroon-950 text-[#FFF9F4] border border-floral-gold/50 shadow-royal-lg',
    flat: 'bg-floral-ivory text-floral-brown border border-floral-gold/20',
  }[variant] || 'bg-white text-floral-brown border border-floral-gold/30';

  const cornerColor = variant === 'maroon' ? 'text-[#FDF3DA] opacity-80' : 'text-floral-gold/70';

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-300 ${variantStyles} ${
        ornate ? 'ornate-border' : ''
      } ${className}`}
      {...props}
    >
      {ornate && (
        <>
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <OrnateCorner position="top-left" className={`w-5 h-5 ${cornerColor}`} />
          </div>
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            <OrnateCorner position="top-right" className={`w-5 h-5 ${cornerColor}`} />
          </div>
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <OrnateCorner position="bottom-left" className={`w-5 h-5 ${cornerColor}`} />
          </div>
          <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
            <OrnateCorner position="bottom-right" className={`w-5 h-5 ${cornerColor}`} />
          </div>
        </>
      )}
      {children}
    </div>
  );
};
