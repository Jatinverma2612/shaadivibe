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
    'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs tracking-wider uppercase',
    md: 'px-5 py-2.5 text-sm font-semibold tracking-wide',
    lg: 'px-7 py-3.5 text-base font-semibold tracking-wide shadow-royal',
  }[size] || 'px-5 py-2.5 text-sm';

  const variantStyles = {
    primary:
      'bg-royal-maroon-700 text-royal-gold-100 hover:bg-royal-maroon-600 border border-royal-gold-500/40 shadow-royal hover:shadow-gold-glow hover:border-royal-gold-400',
    gold:
      'bg-gradient-to-r from-royal-gold-600 via-royal-gold-500 to-royal-gold-700 text-royal-brown-900 font-bold hover:brightness-110 shadow-royal hover:shadow-gold-glow border border-royal-gold-300',
    outline:
      'bg-royal-ivory-card text-royal-maroon-700 border-2 border-royal-gold-500/60 hover:bg-royal-gold-50 hover:border-royal-gold-600 shadow-sm',
    ghost:
      'bg-transparent text-royal-maroon-700 hover:bg-royal-maroon-50/50 hover:text-royal-maroon-900',
    dark:
      'bg-royal-maroon-900 text-royal-gold-200 hover:bg-royal-maroon-950 border border-royal-gold-600/30',
  }[variant] || 'bg-royal-maroon-700 text-royal-gold-100';

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
