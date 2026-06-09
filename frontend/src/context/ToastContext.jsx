import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon = 'ℹ️';
            let bgClass = 'border-neonBlue/40 bg-slate-950/90 shadow-glow-blue text-slate-100';
            if (toast.type === 'success') {
              icon = '✅';
              bgClass = 'border-neonEmerald/40 bg-slate-950/90 shadow-glow-emerald text-slate-100';
            } else if (toast.type === 'error') {
              icon = '❌';
              bgClass = 'border-neonRose/40 bg-slate-950/90 shadow-glow-rose text-slate-100';
            } else if (toast.type === 'warning') {
              icon = '⚠️';
              bgClass = 'border-neonAmber/40 bg-slate-950/90 shadow-glow-amber text-slate-100';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                className={`pointer-events-auto border rounded-xl p-4 flex items-start gap-3 backdrop-blur-md shadow-lg ${bgClass}`}
              >
                <span className="text-lg flex-shrink-0">{icon}</span>
                <div className="flex-grow text-sm font-medium pr-2">{toast.message}</div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-textMuted hover:text-textPrimary text-xs transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
