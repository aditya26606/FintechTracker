import React from 'react';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  CreditCard, 
  GraduationCap, 
  Activity, 
  Package 
} from 'lucide-react';

export const CATEGORIES_CONFIG = {
  Food: { 
    label: 'Food', 
    icon: Utensils, 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/20', 
    hover: 'hover:bg-rose-500/20 hover:border-rose-500/35', 
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]', 
    activeBorder: 'border-rose-500' 
  },
  Travel: { 
    label: 'Travel', 
    icon: Car, 
    color: 'text-sky-400', 
    bg: 'bg-sky-500/10', 
    border: 'border-sky-500/20', 
    hover: 'hover:bg-sky-500/20 hover:border-sky-500/35', 
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.15)]', 
    activeBorder: 'border-sky-500' 
  },
  Shopping: { 
    label: 'Shopping', 
    icon: ShoppingBag, 
    color: 'text-pink-400', 
    bg: 'bg-pink-500/10', 
    border: 'border-pink-500/20', 
    hover: 'hover:bg-pink-500/20 hover:border-pink-500/35', 
    glow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]', 
    activeBorder: 'border-pink-500' 
  },
  Entertainment: { 
    label: 'Entertainment', 
    icon: Film, 
    color: 'text-indigo-400', 
    bg: 'bg-indigo-500/10', 
    border: 'border-indigo-500/20', 
    hover: 'hover:bg-indigo-500/20 hover:border-indigo-500/35', 
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]', 
    activeBorder: 'border-indigo-500' 
  },
  Bills: { 
    label: 'Bills', 
    icon: CreditCard, 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/20', 
    hover: 'hover:bg-amber-500/20 hover:border-amber-500/35', 
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', 
    activeBorder: 'border-amber-500' 
  },
  Education: { 
    label: 'Education', 
    icon: GraduationCap, 
    color: 'text-cyan-400', 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/20', 
    hover: 'hover:bg-cyan-500/20 hover:border-cyan-500/35', 
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]', 
    activeBorder: 'border-cyan-500' 
  },
  Healthcare: { 
    label: 'Healthcare', 
    icon: Activity, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20', 
    hover: 'hover:bg-emerald-500/20 hover:border-emerald-500/35', 
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', 
    activeBorder: 'border-emerald-500' 
  },
  Others: { 
    label: 'Others', 
    icon: Package, 
    color: 'text-slate-400', 
    bg: 'bg-slate-500/10', 
    border: 'border-slate-500/20', 
    hover: 'hover:bg-slate-500/20 hover:border-slate-500/35', 
    glow: 'shadow-[0_0_15px_rgba(148,163,184,0.15)]', 
    activeBorder: 'border-slate-500' 
  }
};
