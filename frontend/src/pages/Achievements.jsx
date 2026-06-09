import React, { useState, useEffect } from 'react';
import apiRequest from '../api';
import { useToast } from '../context/ToastContext';
import { Award, Sparkles, Loader, Shield, Lock, Check } from 'lucide-react';

const Achievements = () => {
  const [loading, setLoading] = useState(true);
  const [gamification, setGamification] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await apiRequest('/achievements');
        setGamification(data);
      } catch (err) {
        toast.showToast('Failed to load gamification achievements.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { level, xp, currentLevelXP, nextLevelXPNeeded, xpPercent, badges } = gamification;

  return (
    <div className="space-y-6">
      
      
      <div className="p-8 glass-card bg-gradient-to-tr from-slate-950 via-[#0f1526] to-slate-950 border border-neonBlue/15 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        
        
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-neonBlue/10 blur-2xl pointer-events-none" />

        
        <div className="flex-shrink-0 relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-neonIndigo to-neonBlue text-white font-extrabold border-4 border-slate-900 shadow-glow-blue/20">
          <div className="absolute inset-0.5 rounded-full border border-white/20 flex flex-col items-center justify-center">
            <span className="text-[10px] text-textSecondary uppercase tracking-widest font-black">Level</span>
            <span className="text-3xl font-black leading-none">{level}</span>
          </div>
        </div>

        
        <div className="flex-grow space-y-4 w-full text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-textPrimary uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
              Financial Status Level Up
              <Sparkles className="text-neonBlue" size={16} />
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Unlock badges and increase your XP levels by logging transactions, configuring savings targets, and maintaining weekly budgets.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-textSecondary">
              <span>{xp.toLocaleString()} Total XP Points</span>
              <span>{currentLevelXP} / {nextLevelXPNeeded} XP to Level {level + 1}</span>
            </div>
            
            
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-glassBorder/30">
              <div 
                className="h-full bg-gradient-to-r from-neonIndigo via-neonBlue to-neonBlue rounded-full shadow-glow-blue"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Badge Achievements Collection</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map(badge => (
            <div 
              key={badge.name} 
              className={`glass-card p-6 flex items-start gap-4 transition-all duration-300 relative border
                ${badge.isUnlocked 
                  ? 'border-neonBlue/20 shadow-glow-blue/5 hover:border-neonBlue/40 bg-[#0f172a]/70' 
                  : 'border-glassBorder/40 opacity-60 bg-slate-950/20'
                }
              `}
            >
              
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border text-2xl
                ${badge.isUnlocked 
                  ? 'bg-neonBlue/10 border-neonBlue/20 text-textPrimary' 
                  : 'bg-slate-900 border-slate-800 text-textMuted'
                }
              `}>
                {badge.isUnlocked ? badge.icon : '🔒'}
              </div>

              
              <div className="space-y-1.5 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h5 className={`text-sm font-bold truncate ${badge.isUnlocked ? 'text-textPrimary' : 'text-textSecondary'}`}>
                    {badge.name}
                  </h5>
                  {badge.isUnlocked && (
                    <span className="p-0.5 rounded bg-neonBlue/15 text-neonBlue border border-neonBlue/10">
                      <Check size={10} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-textSecondary leading-relaxed">{badge.description}</p>
                
                {badge.isUnlocked ? (
                  <span className="block text-[10px] font-bold text-neonBlue uppercase tracking-wider pt-1">
                    Unlocked: {new Date(badge.achievedAt || Date.now()).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                ) : (
                  <span className="block text-[10px] font-bold text-textMuted uppercase tracking-wider pt-1 flex items-center gap-1">
                    <Lock size={10} /> Locked Milestone
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Achievements;
