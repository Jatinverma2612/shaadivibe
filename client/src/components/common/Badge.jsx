import React from 'react';

export const Badge = ({
  children,
  variant = 'gold', // 'gold' | 'maroon' | 'ivory' | 'marigold'
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  }[size] || 'px-3 py-1 text-xs';

  const variantStyles = {
    gold: 'bg-royal-gold-100 text-royal-gold-900 border border-royal-gold-500/40 font-semibold',
    maroon: 'bg-royal-maroon-100 text-royal-maroon-800 border border-royal-maroon-400/40 font-semibold',
    ivory: 'bg-royal-ivory-warm text-royal-brown-700 border border-royal-ivory-border font-medium',
    marigold: 'bg-amber-100 text-amber-900 border border-amber-400/50 font-semibold',
  }[variant] || 'bg-royal-gold-100 text-royal-gold-900';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider select-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};
