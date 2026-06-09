const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  tokenVersion: {
    type: Number,
    default: 0
  },
  preferences: {
    theme: { type: String, default: 'dark' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'English' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    defaultExpenseCategory: { type: String, default: 'Food' },
    budgetAlertPercentage: { type: Number, default: 80 },
    defaultPaymentMethod: { type: String, default: 'Cash' },
    budgetExceededAlerts: { type: Boolean, default: true },
    monthlyExpenseSummary: { type: Boolean, default: true },
    savingsGoalReminders: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false },
    aiSpendingInsights: { type: Boolean, default: true },
    smartExpenseCategorization: { type: Boolean, default: true },
    weeklyFinancialRecommendations: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
