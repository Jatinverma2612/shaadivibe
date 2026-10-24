import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OrnateCorner, FloralDivider } from './Motifs.jsx';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-royal-maroon-950/70 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-royal-ivory-card border-2 border-royal-gold-500/50 rounded-2xl shadow-royal-lg p-6 sm:p-8 z-10 my-8`}
          >
            {/* Corners */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none">
              <OrnateCorner position="top-left" className="w-6 h-6 text-royal-gold-500" />
            </div>
            <div className="absolute top-2.5 right-2.5 pointer-events-none">
              <OrnateCorner position="top-right" className="w-6 h-6 text-royal-gold-500" />
            </div>
            <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
              <OrnateCorner position="bottom-left" className="w-6 h-6 text-royal-gold-500" />
            </div>
            <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
              <OrnateCorner position="bottom-right" className="w-6 h-6 text-royal-gold-500" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-royal-brown-600 hover:text-royal-maroon-700 hover:bg-royal-gold-100 transition-colors z-20"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            {(title || subtitle) && (
              <div className="text-center mb-6">
                {title && (
                  <h3 className="font-serif text-2xl font-bold text-royal-maroon-800 tracking-wide">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs uppercase tracking-widest text-royal-gold-700 font-semibold mt-1">
                    {subtitle}
                  </p>
                )}
                <FloralDivider className="w-36 h-4 text-royal-gold-500 my-2 mx-auto" />
              </div>
            )}

            {/* Content Body */}
            <div className="relative z-10 text-royal-brown-800">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
