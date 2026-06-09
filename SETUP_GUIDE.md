# FintechTracker - Setup & Configuration Guide

Follow these instructions to set up, configure, and run the MERN stack Automated Expense Tracker application.

---

## 🔧 Prerequisites

*   **Node.js**: Version 20.x or higher (LTS version 24.16.0 is installed locally in your user profile).
*   **npm**: Version 10.x or higher.
*   **MongoDB** (Optional): A local MongoDB server running on port `27017` or a MongoDB Atlas connection string. If MongoDB is not running, the application will automatically fall back to local JSON-file storage, so no database installation is strictly required to test or run the demo!

---

## 🚀 Setup Steps

### Step 1: Install Node.js Dependencies

Open a terminal in the root workspace and install dependencies for both components:

**1. Install Backend Packages:**
```bash
cd backend
npm install
```

**2. Install Frontend Packages:**
```bash
cd frontend
npm install
```

---

### Step 2: Configure Environment Variables

Create or update the configuration file in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=fdf6e987c093a123f3a8bce5d87a6c9e012356ab9cd4d5f190e2b34a5d
```

*   **PORT**: The port where the Express server will listen (defaults to `5000`).
*   **MONGODB_URI**: MongoDB connection string. If a MongoDB server is not running on this URI, the server will log a warning and fall back to JSON database mode writing files in `backend/database/data/`.
*   **JWT_SECRET**: The signature key used to hash login sessions and tokens. Set this to any secure random text string.

---

### Step 3: Run the Application

To run the application locally, you will need to start both the backend server and the frontend Vite development server.

#### 1. Start the Backend API Server
```bash
cd backend
npm start
```
*   Server listens on `http://localhost:5000`.
*   Verify it works by visiting `http://localhost:5000/` in your browser. It should respond with `{"message":"Automated Expense Tracker API is running..."}`.

#### 2. Start the Frontend React App
```bash
cd frontend
npm run dev
```
*   Vite server starts on `http://localhost:5173/`.
*   Open `http://localhost:5173/` in your browser to view the Landing Page and sign up.

---

## 📋 Features & Usage Heuristics

### 1. Database Backup & Restore
*   Go to **Settings** (`/settings`) from the Sidebar.
*   **Export JSON Backup**: Click to download a full snapshot of your logged expenses, goals, budgets, and preferences.
*   **Import JSON Backup**: Select a previously exported backup file to restore your profile data logs instantly.

### 2. Receipt OCR Scanning
*   Go to **Expense Tracker** (`/expenses`).
*   Click **Add Expense** to open the modal.
*   Drag and drop a receipt picture or select one under the **Receipt Scan (OCR)** input.
*   Wait for the scanning loader to process. The engine will extract the date and amount totals, filling them in the form inputs automatically.

### 3. Speech Recognition Input
*   Open the **Add Expense** modal in the **Expense Tracker** page.
*   Click **Voice Log** (Mic icon).
*   Speak details clearly, e.g.: *"Spent 350 rupees on dinner"* or *"Uber taxi ride cost me 500"*.
*   The parser will extract the amount, matching category (Food, Travel, Shopping, etc.), and clean description, auto-filling the inputs. Click "Log Transaction" to submit.
