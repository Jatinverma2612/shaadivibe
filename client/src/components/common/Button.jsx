import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-floral-gold/50 active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 min-h-[38px] text-xs font-semibold tracking-wider uppercase',
    md: 'px-5 py-2.5 min-h-[44px] text-sm font-semibold tracking-wide',
    lg: 'px-7 py-3.5 min-h-[50px] text-base font-semibold tracking-wide shadow-royal',
  }[size] || 'px-5 py-2.5 min-h-[44px] text-sm';

  const variantStyles = {
    primary:
      'bg-floral-burgundy text-white hover:bg-royal-maroon-600 border border-floral-gold/40 shadow-royal hover:shadow-gold-glow',
    gold:
      'bg-gradient-to-r from-royal-gold-600 via-royal-gold-500 to-royal-gold-700 text-floral-brown font-bold hover:brightness-105 shadow-royal hover:shadow-gold-glow border border-floral-gold/50',
    outline:
      'bg-white text-floral-burgundy border-2 border-floral-gold/60 hover:bg-floral-blush/60 hover:border-floral-gold shadow-sm',
    ghost:
      'bg-transparent text-floral-burgundy hover:bg-floral-blush/60 hover:text-royal-maroon-900',
    sage:
      'bg-royal-sage text-white hover:bg-royal-sage-dark border border-royal-sage-light/40 shadow-sm',
    dark:
      'bg-royal-maroon-950 text-floral-gold hover:bg-black border border-floral-gold/40',
    maroonOutline:
      'bg-white/10 text-[#FFF9F4] border-2 border-floral-gold/80 hover:bg-white/20 hover:text-[#FDF3DA] shadow-sm',
  }[variant] || 'bg-floral-burgundy text-white';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
      {children}
    </button>
  );
};
