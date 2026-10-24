import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      type = 'text',
      className = '',
      id,
      name,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-royal-brown-700">
            {label}
            {required && <span className="text-royal-maroon-600 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={`w-full px-4 py-2.5 rounded-lg bg-royal-ivory-card border text-royal-brown-900 placeholder:text-royal-brown-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/40 focus:border-royal-gold-500 shadow-sm ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-royal-gold-500/30 hover:border-royal-gold-500/60'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-royal-brown-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      rows = 3,
      className = '',
      id,
      name,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-royal-brown-700">
            {label}
            {required && <span className="text-royal-maroon-600 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          className={`w-full px-4 py-2.5 rounded-lg bg-royal-ivory-card border text-royal-brown-900 placeholder:text-royal-brown-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/40 focus:border-royal-gold-500 shadow-sm resize-y ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-royal-gold-500/30 hover:border-royal-gold-500/60'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-royal-brown-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
