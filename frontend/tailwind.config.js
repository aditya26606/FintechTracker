
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        darkCard: 'rgba(17, 24, 39, 0.55)',
        glassBorder: 'rgba(255, 255, 255, 0.07)',
        neonBlue: '#38bdf8',
        neonIndigo: '#6366f1',
        neonEmerald: '#10b981',
        neonRose: '#f43f5e',
        neonAmber: '#f59e0b',
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        textMuted: '#64748b'
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-blue': '0 0 15px rgba(56, 189, 248, 0.4)',
        'glow-indigo': '0 0 15px rgba(99, 102, 241, 0.4)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.4)'
      },
      backdropBlur: {
        'glass': '12px'
      }
    },
  },
  plugins: [],
}
