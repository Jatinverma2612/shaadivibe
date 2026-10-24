import React from 'react';

export const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1.5 bg-royal-ivory-warm border border-royal-gold-500/30 rounded-xl overflow-x-auto max-w-full ${className}`}
    >
      {tabs.map((tab) => {
        const id = typeof tab === 'string' ? tab : tab.id;
        const label = typeof tab === 'string' ? tab : tab.label;
        const count = typeof tab === 'object' ? tab.count : null;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
              isActive
                ? 'bg-royal-maroon-700 text-royal-gold-100 shadow-sm border border-royal-gold-500/40'
                : 'text-royal-brown-700 hover:text-royal-maroon-700 hover:bg-royal-gold-50/80'
            }`}
          >
            <span>{label}</span>
            {count !== null && count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-royal-gold-500 text-royal-brown-900' : 'bg-royal-ivory-border text-royal-brown-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
