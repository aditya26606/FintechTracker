import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  Award,
  Mic,
  BarChart3,
  Wallet,
  FileText,
  Users
} from 'lucide-react';

const stats = [
  { value: '10K+', label: 'Expenses Tracked' },
  { value: '₹50L+', label: 'Managed Monthly' },
  { value: '6', label: 'Smart Categories' },
  { value: '99.9%', label: 'Uptime Reliability' },
];

const features = [
  {
    icon: Receipt,
    color: 'neonBlue',
    bgClass: 'bg-neonBlue/10',
    textClass: 'text-neonBlue',
    hoverBorderClass: 'hover:border-neonBlue/25',
    title: 'Instant OCR Scanner',
    desc: 'Drag-and-drop receipt scans. Our client-side OCR engine auto-extracts dates and total amounts, autofilling details instantly.',
  },
  {
    icon: Mic,
    color: 'neonIndigo',
    bgClass: 'bg-neonIndigo/10',
    textClass: 'text-neonIndigo',
    hoverBorderClass: 'hover:border-neonIndigo/25',
    title: 'Voice Commands Log',
    desc: 'Log expenses by talking. Tell FintechTracker "spent 250 rupees on dinner" and let the speech engine extract amounts and categories.',
  },
  {
    icon: Award,
    color: 'neonEmerald',
    bgClass: 'bg-neonEmerald/10',
    textClass: 'text-neonEmerald',
    hoverBorderClass: 'hover:border-neonEmerald/25',
    title: 'Gamified Badges',
    desc: 'Earn XP points, level up, and unlock awards like Budget Keeper and Savings Champion as you reinforce positive budget choices.',
  },
  {
    icon: BarChart3,
    color: 'neonBlue',
    bgClass: 'bg-neonBlue/10',
    textClass: 'text-neonBlue',
    hoverBorderClass: 'hover:border-neonBlue/25',
    title: 'Smart Analytics',
    desc: 'Visualise spending trends, category breakdowns, and get AI-powered monthly forecasts with moving average projections.',
  },
  {
    icon: Wallet,
    color: 'neonAmber',
    bgClass: 'bg-neonAmber/10',
    textClass: 'text-neonAmber',
    hoverBorderClass: 'hover:border-neonAmber/25',
    title: 'Budget Management',
    desc: 'Set monthly spending limits with real-time progress bars. Get automatic warnings at 80% and danger alerts when exceeded.',
  },
  {
    icon: FileText,
    color: 'neonRose',
    bgClass: 'bg-neonRose/10',
    textClass: 'text-neonRose',
    hoverBorderClass: 'hover:border-neonRose/25',
    title: 'Report Exports',
    desc: 'Generate daily, weekly, monthly or yearly financial summaries. Download as CSV, Excel or PDF reports in one click.',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-darkBg text-textPrimary flex flex-col selection:bg-neonBlue/30 selection:text-white">
      
      <header className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-glassBorder/40">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-gradient-to-tr from-neonIndigo to-neonBlue text-white font-bold shadow-glow-blue">
            💰
          </span>
          <span className="text-xl font-bold tracking-tight">
            Fintech<span className="text-neonBlue">Tracker</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors">
            Login
          </Link>
          <Link to="/signup" className="glass-btn-primary py-2 px-5 text-sm">
            Sign Up Free
          </Link>
        </div>
      </header>

      
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 flex flex-col justify-center py-20 relative overflow-hidden">
        
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-neonIndigo/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-neonBlue/8 blur-[120px] pointer-events-none" />

        
        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="badge-float inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neonBlue/10 border border-neonBlue/25 text-neonBlue text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-neonBlue animate-pulse" />
            Smart Financial Assistant
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-textPrimary via-textPrimary to-neonBlue">
            Automate Your Expense Tracking
          </h1>
          <p className="text-lg text-textSecondary leading-relaxed">
            Scan receipts with instant OCR, log transactions using voice commands, define budgets, and unlock badges with gamified achievements. Perfect for building financial discipline.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="glass-btn-primary px-8 py-3.5 text-base w-full sm:w-auto">
              Get Started Free
            </Link>
            <Link to="/login" className="glass-btn-secondary px-8 py-3.5 text-base w-full sm:w-auto">
              Access My Account
            </Link>
          </div>
        </div>

        
        <div className="mt-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-glassBorder rounded-2xl overflow-hidden border border-glassBorder">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-6 px-4 bg-slate-900/30 backdrop-blur-md text-center"
              >
                <span className="text-2xl font-extrabold text-textPrimary tracking-tight">{stat.value}</span>
                <span className="text-xs text-textMuted mt-1 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`glass-card p-7 hover:-translate-y-1.5 transition-all duration-300 ${f.hoverBorderClass} group cursor-default`}
              >
                <div className={`w-11 h-11 rounded-xl ${f.bgClass} ${f.textClass} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold mb-2 text-textPrimary">{f.title}</h3>
                <p className="text-sm text-textSecondary leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      
      <footer className="py-8 border-t border-glassBorder/30 text-center text-xs text-textMuted bg-slate-950/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-tr from-neonIndigo to-neonBlue text-white text-xs">💰</span>
            <span className="font-semibold text-textSecondary">FintechTracker</span>
            <span>© 2026 — Premium Financial Management</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-textSecondary transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-textSecondary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
