import React from 'react';
import { Layers } from 'lucide-react';
import { CATEGORIES_CONFIG } from './CategoryConfig';

const CategoryPillFilter = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      
      <button
        type="button"
        onClick={() => onChange('')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer
          ${value === '' 
            ? 'bg-neonBlue/15 border-neonBlue text-neonBlue shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
            : 'bg-slate-900/40 border-slate-700/40 text-textSecondary hover:bg-slate-900/60 hover:text-textPrimary hover:border-slate-600'
          }
        `}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All Categories</span>
      </button>

      
      {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => {
        const IconComponent = config.icon;
        const isSelected = value === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer
              ${isSelected 
                ? `${config.bg} ${config.activeBorder} ${config.color} ${config.glow}` 
                : 'bg-slate-900/40 border-slate-700/40 text-textSecondary hover:bg-slate-900/60 hover:text-textPrimary hover:border-slate-600'
              }
            `}
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPillFilter;
