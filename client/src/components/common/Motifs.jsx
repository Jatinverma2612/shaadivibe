import React from 'react';

/**
 * Auspicious Shree Ganesha / Sacred Symbol Motif
 */
export const GaneshaSymbol = ({ className = "w-10 h-10 text-royal-gold-500" }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Stylized Om / Ganesha silhouette */}
    <path d="M50 12 C44 12, 40 16, 40 22 C40 28, 44 32, 50 32 C56 32, 60 28, 60 22 C60 16, 56 12, 50 12 Z M50 18 C52 18, 54 20, 54 22 C54 24, 52 26, 50 26 C48 26, 46 24, 46 22 C46 20, 48 18, 50 18 Z" />
    <path d="M50 34 C36 34, 26 44, 26 56 C26 66, 32 74, 42 78 C38 82, 34 88, 32 94 L38 94 C40 88, 45 82, 50 82 C55 82, 60 88, 62 94 L68 94 C66 88, 62 82, 58 78 C68 74, 74 66, 74 56 C74 44, 64 34, 50 34 Z M50 72 C40 72, 32 64, 32 54 C32 46, 40 40, 50 40 C60 40, 68 46, 68 54 C68 64, 60 72, 50 72 Z" />
    <circle cx="50" cy="52" r="4" />
    <path d="M22 46 C22 38, 28 32, 34 32 L34 36 C30 36, 26 40, 26 46 Z" />
    <path d="M78 46 C78 40, 74 36, 70 36 L70 32 C76 32, 82 38, 82 46 Z" />
  </svg>
);

/**
 * Royal Corner Flourish / Gold Ornate Corner
 */
export const OrnateCorner = ({ className = "w-8 h-8 text-royal-gold-500", position = "top-left" }) => {
  const rotationClass = {
    "top-left": "",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "-rotate-90",
  }[position] || "";

  return (
    <div className={`pointer-events-none select-none inline-block ${rotationClass}`}>
      <svg viewBox="0 0 40 40" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2 L2 20 C2 21 3 21 3 20 L3 5 C3 3.9 3.9 3 5 3 L20 3 C21 3 21 2 20 2 Z" opacity="0.9" />
        <path d="M6 6 L6 14 C6 14.5 6.5 14.5 6.5 14 L6.5 7.5 C6.5 7 7 6.5 7.5 6.5 L14 6.5 C14.5 6.5 14.5 6 14 6 Z" opacity="0.7" />
        <circle cx="10" cy="10" r="1.5" />
        <path d="M2 2 L12 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/**
 * Indian Royal Floral Mandap Divider
 */
export const FloralDivider = ({ className = "w-full max-w-xs h-6 text-royal-gold-500 my-4" }) => (
  <div className="flex items-center justify-center gap-2 select-none">
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-royal-gold-500/60 to-royal-gold-500" />
    <svg viewBox="0 0 60 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4 C32 8, 36 10, 42 10 C36 10, 32 12, 30 16 C28 12, 24 10, 18 10 C24 10, 28 8, 30 4 Z" />
      <circle cx="30" cy="10" r="2" />
      <circle cx="14" cy="10" r="1.5" />
      <circle cx="46" cy="10" r="1.5" />
      <path d="M4 10 L10 10 M50 10 L56 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-royal-gold-500/60 to-royal-gold-500" />
  </div>
);

/**
 * Sacred Lotus Flower Motif
 */
export const LotusMotif = ({ className = "w-8 h-8 text-royal-gold-500" }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8 C32 8, 20 28, 24 46 C28 50, 36 50, 40 46 C44 28, 32 8, 32 8 Z" opacity="0.9" />
    <path d="M32 20 C24 28, 12 36, 12 46 C12 52, 20 54, 26 50 C28 42, 32 32, 32 20 Z" opacity="0.75" />
    <path d="M32 20 C40 28, 52 36, 52 46 C52 52, 44 54, 38 50 C36 42, 32 32, 32 20 Z" opacity="0.75" />
    <path d="M22 52 C28 56, 36 56, 42 52 C40 54, 36 56, 32 56 C28 56, 24 54, 22 52 Z" />
  </svg>
);

/**
 * Kalash Sacred Pot Motif
 */
export const KalashMotif = ({ className = "w-8 h-8 text-royal-gold-500" }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Coconut atop mango leaves */}
    <circle cx="32" cy="18" r="8" opacity="0.9" />
    <path d="M20 26 C24 20, 30 18, 32 18 C34 18, 40 20, 44 26 C38 24, 32 25, 26 25 Z" opacity="0.8" />
    {/* Pot (Lota) */}
    <path d="M22 28 L42 28 C46 36, 48 44, 42 52 C38 56, 26 56, 22 52 C16 44, 18 36, 22 28 Z" />
    {/* Swastik / Auspicious symbol on pot */}
    <circle cx="32" cy="40" r="3" fill="#5C061D" />
    {/* Base */}
    <path d="M24 54 L40 54 L38 58 L26 58 Z" opacity="0.9" />
  </svg>
);

/**
 * Royal Diya / Oil Lamp
 */
export const DiyaMotif = ({ className = "w-8 h-8 text-royal-gold-500" }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Flame */}
    <path d="M32 8 C32 8, 26 18, 28 26 C30 30, 34 30, 36 26 C38 18, 32 8, 32 8 Z" fill="#E67A15" />
    <circle cx="32" cy="24" r="3" fill="#F8A542" />
    {/* Earthen Lamp Dish */}
    <path d="M12 36 C14 48, 50 48, 52 36 C42 42, 22 42, 12 36 Z" />
    {/* Base Stand */}
    <path d="M26 44 L38 44 L42 52 L22 52 Z" opacity="0.85" />
  </svg>
);

/**
 * Royal Wax Seal Monogram Badge
 */
export const WaxSealBadge = ({
  initials = "S&V",
  size = "md",
  className = "",
  onClick,
}) => {
  const sizeClasses = {
    sm: "w-14 h-14 text-sm",
    md: "w-20 h-20 text-base",
    lg: "w-28 h-28 text-xl",
  }[size] || "w-20 h-20 text-base";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-full wax-seal-btn flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-amber-300/40 ${sizeClasses} ${className}`}
      title="Open Royal Envelope"
    >
      {/* Outer scalloped ring */}
      <div className="absolute inset-1.5 rounded-full border border-dashed border-amber-200/50 pointer-events-none" />
      {/* Embossed monogram */}
      <div className="font-serif font-bold tracking-wider text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-10 select-none">
        {initials}
      </div>
      <div className="absolute -bottom-1 text-[8px] tracking-widest text-amber-300/80 uppercase font-sans font-semibold">
        SHAADI
      </div>
    </button>
  );
};
