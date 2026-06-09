import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ value, onChange, options, placeholder = 'Select option', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );

  const getLabel = (opt) => {
    if (!opt) return placeholder;
    if (typeof opt === 'string') return opt;
    return (
      <span className="flex items-center gap-2">
        {opt.icon && <span className="text-base">{opt.icon}</span>}
        <span>{opt.label}</span>
      </span>
    );
  };

  const handleSelect = (opt) => {
    const val = typeof opt === 'string' ? opt : opt.value;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-textPrimary text-sm focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue/30 transition-all flex items-center justify-between gap-2 cursor-pointer text-left shadow-inner"
      >
        <span className="truncate">{getLabel(selectedOption)}</span>
        <ChevronDown size={16} className={`text-textMuted transition-transform duration-200 ${isOpen ? 'rotate-180 text-neonBlue' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[6000] w-full mt-1.5 bg-[#0b0f19] border border-glassBorder rounded-xl shadow-glass overflow-hidden max-h-60 overflow-y-auto"
          >
            {options.map((opt, idx) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const isSelected = val === value;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 cursor-pointer
                    ${isSelected 
                      ? 'bg-neonBlue/15 text-neonBlue font-semibold' 
                      : 'text-textSecondary hover:bg-slate-900/60 hover:text-textPrimary'
                    }
                  `}
                >
                  {typeof opt === 'string' ? opt : (
                    <>
                      {opt.icon && <span className="text-base flex-shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
