import React from 'react';
import { CATEGORIES_CONFIG } from './CategoryConfig';

const CategorySelector = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => {
        const IconComponent = config.icon;
        const isSelected = value === key;
        
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 cursor-pointer relative overflow-hidden group
              ${isSelected 
                ? `${config.bg} ${config.activeBorder} ${config.glow} scale-[1.02] shadow-inner` 
                : 'bg-slate-900/30 border-slate-800/60 text-textSecondary hover:bg-slate-900/50 hover:border-slate-700/60 hover:text-textPrimary'
              }
            `}
          >
            
            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className={`p-3 rounded-xl mb-2 transition-all duration-300 group-hover:scale-110
              ${isSelected ? 'bg-slate-950/50 ring-1 ring-white/5' : 'bg-slate-900/40'}
            `}>
              <IconComponent className={`w-5 h-5 ${config.color}`} />
            </div>
            
            <span className={`text-xs font-bold tracking-wide transition-colors
              ${isSelected ? 'text-textPrimary' : 'text-textSecondary group-hover:text-textPrimary'}
            `}>
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategorySelector;
