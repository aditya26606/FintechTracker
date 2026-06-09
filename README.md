# FintechTracker - Full-Stack MERN Automated Expense Tracker

A modern, professional full-stack financial management workspace. Built with React, Tailwind CSS, Framer Motion, Chart.js, Express.js, and MongoDB. It tracks expenditures, budgets, and savings targets with gamified achievements, natural language voice inputs, and optical receipt scans.

---

## 🌟 Key Features

*   **Multi-Page Router Layout**: Structured navigation managing separate landing, auth, dashboard, budget, savings goals, achievements, settings, and reports views.
*   **Fintech Theme styling**: Gorgeous dark-blue fintech layout using glassmorphism cards and micro-animations.
*   **Dual-Database Adapter (Zero Setup)**: Seamless database controller in the Express backend. Connects to MongoDB when available or automatically falls back to local JSON-file storage if MongoDB is not running.
*   **Instant Receipt OCR Scanner**: Client-side drag-and-drop receipt image parsing using Tesseract.js.
*   **Web Speech Commands Log**: Native voice parser translating verbal statements (e.g. *"spent 300 on transport"*) into logged amounts, categories, and descriptions.
*   **Intelligent Insights & Projections**: Category comparisons, monthly spent trends, budget warnings, and moving average expense forecasts.
*   **Gamified Badge Rewards**: Earn experience points (XP) and level up. Unlock badges (First Expense, Expense Master, Budget Keeper, Savings Champion, Goal Achiever, 30-Day Streak).
*   **Report Generation Exports**: HTML summary statement logs for daily/weekly/monthly/yearly reports, supporting client-side downloads to CSV/Excel or PDF (via jsPDF).
*   **Settings Preferences panel**: Theme selector, dynamic currency display toggle (₹, $, €, £), system notification preferences, and JSON database export/restore backups.

---

## 📁 Project Directory Layout

```
tracker/
├── backend/                  # Node/Express API backend
│   ├── config/               # Database config & adapter helper
│   ├── database/data/        # Local JSON database files (fallback mode)
│   ├── middleware/           # JWT Authorization validation
│   ├── models/               # Mongoose Schemas (User, Expense, etc.)
│   ├── routes/               # API route endpoints
│   ├── uploads/receipts/     # Multer folder for receipt uploads
│   ├── server.js             # Express entry server
│   └── .env                  # Configuration variables
├── frontend/                 # Vite/React frontend
│   ├── src/
│   │   ├── components/       # Reusable components (Sidebar, VoiceInput)
│   │   ├── context/          # Context providers (Auth, Toast)
│   │   ├── pages/            # View pages (Dashboard, Expenses, Analytics, etc.)
│   │   ├── api.js            # fetch requester wrapper
│   │   └── index.css         # Tailwind v4 styles & directives
│   ├── tailwind.config.js    # Tailwind configurations
│   ├── postcss.config.js     # PostCSS configurations
│   └── index.html            # Main HTML document markup
```

---

## 🛠️ Quick Start Instructions

Please check [SETUP_GUIDE.md](SETUP_GUIDE.md) for full detailed instructions.

### 1. Start backend server
```bash
cd backend
npm install
npm start
```
*   The backend will run on `http://localhost:5000`.
*   It automatically falls back to JSON DB mode if MongoDB is not active on port 27017.

### 2. Start frontend dev server
```bash
cd frontend
npm install
npm run dev
```
*   The frontend will run on `http://localhost:5173`.
*   Open `http://localhost:5173` in your browser to sign up and start tracking!
