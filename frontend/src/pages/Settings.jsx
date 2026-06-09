import React, { useState, useEffect } from 'react';
import apiRequest, { BACKEND_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CustomSelect from '../components/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Palette, 
  Coins, 
  Bell, 
  Database, 
  ShieldAlert, 
  Download, 
  Upload, 
  Loader, 
  Lock, 
  Camera, 
  Languages, 
  Calendar, 
  Plus,
  Trash2,
  LogOut,
  Brain,
  AlertTriangle,
  Check,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

const themeOptions = [
  { value: 'dark', label: 'Dark Theme (Recommended)', icon: '🌙' },
  { value: 'light', label: 'Light Theme', icon: '☀️' }
];

const currencyOptions = [
  { value: 'INR', label: 'INR (₹)', icon: '₹' },
  { value: 'USD', label: 'USD ($)', icon: '$' },
  { value: 'EUR', label: 'EUR (€)', icon: '€' },
  { value: 'GBP', label: 'GBP (£)', icon: '£' }
];

const languageOptions = [
  { value: 'English', label: 'English', icon: '🇺🇸' },
  { value: 'Hindi', label: 'Hindi (हिंदी)', icon: '🇮🇳' },
  { value: 'Spanish', label: 'Spanish (Español)', icon: '🇪🇸' },
  { value: 'French', label: 'French (Français)', icon: '🇫🇷' }
];

const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 09/06/2026)', icon: '📅' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 06/09/2026)', icon: '📅' }
];

const categoryOptions = [
  { value: 'Food', label: 'Food', icon: '🍔' },
  { value: 'Travel', label: 'Travel', icon: '🚗' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'Bills', label: 'Bills', icon: '💳' },
  { value: 'Education', label: 'Education', icon: '🎓' },
  { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'Others', label: 'Others', icon: '📦' }
];

const paymentMethodOptions = [
  { value: 'Cash', label: 'Cash', icon: '💵' },
  { value: 'Card', label: 'Debit/Credit Card', icon: '💳' },
  { value: 'UPI', label: 'UPI / NetBanking', icon: '📱' }
];

const alertPercentageOptions = [
  { value: 80, label: '80% of limit', icon: '⚠️' },
  { value: 90, label: '90% of limit', icon: '⚠️' },
  { value: 100, label: '100% of limit (Strict)', icon: '🛑' }
];

const tabs = [
  { id: 'profile', label: 'Basic Settings', icon: User },
  { id: 'preferences', label: 'App Preferences', icon: Palette },
  { id: 'expenses', label: 'Expense & Budget', icon: Coins },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'security', label: 'Security & AI', icon: ShieldAlert }
];

const Settings = () => {
  const { user, loading, updateProfile, changePassword, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto ? `${BACKEND_URL}${user.profilePhoto}` : '');

  
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR');
  const [language, setLanguage] = useState(user?.preferences?.language || 'English');
  const [dateFormat, setDateFormat] = useState(user?.preferences?.dateFormat || 'DD/MM/YYYY');

  
  const [defaultCategory, setDefaultCategory] = useState(user?.preferences?.defaultExpenseCategory || 'Food');
  const [monthlyBudget, setMonthlyBudget] = useState('0');
  const [budgetAlertPercentage, setBudgetAlertPercentage] = useState(user?.preferences?.budgetAlertPercentage || 80);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(user?.preferences?.defaultPaymentMethod || 'Cash');

  
  const [budgetExceededAlerts, setBudgetExceededAlerts] = useState(user?.preferences?.budgetExceededAlerts ?? true);
  const [monthlyExpenseSummary, setMonthlyExpenseSummary] = useState(user?.preferences?.monthlyExpenseSummary ?? true);
  const [savingsGoalReminders, setSavingsGoalReminders] = useState(user?.preferences?.savingsGoalReminders ?? true);
  const [emailNotifications, setEmailNotifications] = useState(user?.preferences?.emailNotifications ?? true);

  
  const [twoFactorAuth, setTwoFactorAuth] = useState(user?.preferences?.twoFactorAuth ?? false);
  const [aiSpendingInsights, setAiSpendingInsights] = useState(user?.preferences?.aiSpendingInsights ?? true);
  const [smartExpenseCategorization, setSmartExpenseCategorization] = useState(user?.preferences?.smartExpenseCategorization ?? true);
  const [weeklyFinancialRecommendations, setWeeklyFinancialRecommendations] = useState(user?.preferences?.weeklyFinancialRecommendations ?? true);

  
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [destructiveLoading, setDestructiveLoading] = useState(false);

  
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const budgetData = await apiRequest('/budgets');
        if (budgetData) {
          setMonthlyBudget(budgetData.monthlyBudget.toString());
        }
      } catch (err) {
        console.error('Error fetching budget:', err);
      }
    };
    fetchBudget();
  }, []);

  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhotoPreview(user.profilePhoto ? `${BACKEND_URL}${user.profilePhoto}` : '');
      
      if (user.preferences) {
        setTheme(user.preferences.theme || 'dark');
        setCurrency(user.preferences.currency || 'INR');
        setLanguage(user.preferences.language || 'English');
        setDateFormat(user.preferences.dateFormat || 'DD/MM/YYYY');
        setDefaultCategory(user.preferences.defaultExpenseCategory || 'Food');
        setBudgetAlertPercentage(user.preferences.budgetAlertPercentage || 80);
        setDefaultPaymentMethod(user.preferences.defaultPaymentMethod || 'Cash');
        setBudgetExceededAlerts(user.preferences.budgetExceededAlerts ?? true);
        setMonthlyExpenseSummary(user.preferences.monthlyExpenseSummary ?? true);
        setSavingsGoalReminders(user.preferences.savingsGoalReminders ?? true);
        setEmailNotifications(user.preferences.emailNotifications ?? true);
        setTwoFactorAuth(user.preferences.twoFactorAuth ?? false);
        setAiSpendingInsights(user.preferences.aiSpendingInsights ?? true);
        setSmartExpenseCategorization(user.preferences.smartExpenseCategorization ?? true);
        setWeeklyFinancialRecommendations(user.preferences.weeklyFinancialRecommendations ?? true);
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const response = await apiRequest('/auth/profile-photo', 'POST', formData, true);
      setPhotoPreview(`${BACKEND_URL}${response.profilePhoto}`);
      
      await updateProfile({ profilePhoto: response.profilePhoto });
      toast.showToast('Profile photo updated successfully!', 'success');
    } catch (err) {
      toast.showToast(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  
  const handleSaveBasic = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.showToast('Name and email are required.', 'error');
      return;
    }
    setSavingBasic(true);
    try {
      await updateProfile({ name, email });
      toast.showToast('Profile basic details updated successfully!', 'success');
    } catch (err) {
      toast.showToast(err.message || 'Failed to update profile details.', 'error');
    } finally {
      setSavingBasic(false);
    }
  };

  
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.showToast('All password fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.showToast('New passwords do not match.', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  
  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      await updateProfile({
        preferences: {
          ...(user?.preferences || {}),
          theme,
          currency,
          language,
          dateFormat
        }
      });
      toast.showToast('App preferences saved successfully!', 'success');
    } catch (err) {
      toast.showToast('Failed to save app preferences.', 'error');
    } finally {
      setSavingPreferences(false);
    }
  };

  
  const handleSaveExpenseSettings = async () => {
    setSavingExpense(true);
    try {
      
      await apiRequest('/budgets', 'POST', {
        monthlyBudget: parseFloat(monthlyBudget) || 0
      });

      
      await updateProfile({
        preferences: {
          ...(user?.preferences || {}),
          defaultExpenseCategory: defaultCategory,
          budgetAlertPercentage,
          defaultPaymentMethod
        }
      });

      toast.showToast('Expense and budget configurations saved!', 'success');
    } catch (err) {
      toast.showToast('Failed to save expense settings.', 'error');
    } finally {
      setSavingExpense(false);
    }
  };

  
  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await updateProfile({
        preferences: {
          ...(user?.preferences || {}),
          budgetExceededAlerts,
          monthlyExpenseSummary,
          savingsGoalReminders,
          emailNotifications
        }
      });
      toast.showToast('Notification preferences updated!', 'success');
    } catch (err) {
      toast.showToast('Failed to save notifications.', 'error');
    } finally {
      setSavingNotifications(false);
    }
  };

  
  const handleSaveSecurity = async () => {
    setSavingSecurity(true);
    try {
      await updateProfile({
        preferences: {
          ...(user?.preferences || {}),
          twoFactorAuth,
          aiSpendingInsights,
          smartExpenseCategorization,
          weeklyFinancialRecommendations
        }
      });
      toast.showToast('Security and AI settings updated!', 'success');
    } catch (err) {
      toast.showToast('Failed to save settings.', 'error');
    } finally {
      setSavingSecurity(false);
    }
  };

  
  const handleLogoutAllDevices = async () => {
    if (!window.confirm('Are you sure you want to log out from all devices? You will be logged out of this session.')) return;
    try {
      await apiRequest('/auth/logout-all', 'POST');
      toast.showToast('Logged out of all devices successfully.', 'success');
      setTimeout(() => logout(), 1000);
    } catch (err) {
      toast.showToast('Failed to logout from all devices.', 'error');
    }
  };

  
  const handleDeleteAccount = async () => {
    const prompt = window.prompt('WARNING: This action is permanent! To delete your account and all associated transaction logs, type "DELETE":');
    if (prompt !== 'DELETE') {
      toast.showToast('Account deletion cancelled.', 'info');
      return;
    }

    setDestructiveLoading(true);
    try {
      await apiRequest('/auth/delete-account', 'DELETE');
      toast.showToast('Your account was successfully deleted.', 'success');
      setTimeout(() => logout(), 1500);
    } catch (err) {
      toast.showToast('Failed to delete account.', 'error');
      setDestructiveLoading(false);
    }
  };

  
  const handleClearAllData = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete all expenses, budgets, savings goals, and badges? This cannot be undone.')) return;
    
    setDestructiveLoading(true);
    try {
      const res = await apiRequest('/settings/clear-data', 'POST');
      toast.showToast(res.message, 'success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      toast.showToast('Failed to clear database logs.', 'error');
      setDestructiveLoading(false);
    }
  };

  
  const exportPDF = async () => {
    try {
      const expenses = await apiRequest('/expenses');
      const printWindow = window.open('', '_blank');
      
      const rowsHtml = expenses.map(e => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <td style="padding: 10px; color: #1e293b;">${new Date(e.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
          <td style="padding: 10px; color: #1e293b; font-weight: 500;">${e.category}</td>
          <td style="padding: 10px; color: #475569;">${e.description || '-'}</td>
          <td style="padding: 10px; text-align: right; color: #0f172a; font-weight: bold;">₹${e.amount.toFixed(2)}</td>
        </tr>
      `).join('');

      const total = expenses.reduce((sum, item) => sum + item.amount, 0);

      printWindow.document.write(`
        <html>
          <head>
            <title>FintechTracker - Expense Audit Report</title>
            <style>
              body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0f172a; background-color: #ffffff; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
              .info { font-size: 13px; text-align: right; color: #64748b; }
              table { width: 100%; border-collapse: collapse; margin-top: 30px; }
              th { background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px 10px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #475569; }
              .total-row { border-top: 2px solid #94a3b8; font-size: 15px; font-weight: bold; }
              .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">FintechTracker</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Smart Financial Control Report</div>
              </div>
              <div class="info">
                <strong>User:</strong> ${user.name} (${user.email})<br/>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}<br/>
                <strong>Count:</strong> ${expenses.length} Records
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px 10px; text-align: right;">Grand Total:</td>
                  <td style="padding: 15px 10px; text-align: right; color: #ef4444;">₹${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              FintechTracker App. Generated securely from client browser session. Keep tracking for a stronger future!
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.showToast('PDF print layout loaded.', 'success');
    } catch (err) {
      toast.showToast('Failed to export PDF format.', 'error');
    }
  };

  
  const exportCSV = async () => {
    try {
      const expenses = await apiRequest('/expenses');
      const headers = ['Date', 'Category', 'Description', 'Amount'];
      const rows = expenses.map(e => [
        new Date(e.date).toISOString().split('T')[0],
        e.category,
        e.description || '',
        e.amount
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `fintech-tracker-expenses-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.showToast('CSV database logs exported.', 'success');
    } catch (err) {
      toast.showToast('Failed to export CSV.', 'error');
    }
  };

  
  const exportExcel = async () => {
    try {
      const expenses = await apiRequest('/expenses');
      const headers = ['Date\tCategory\tDescription\tAmount'];
      const rows = expenses.map(e => [
        new Date(e.date).toISOString().split('T')[0],
        e.category,
        e.description || '',
        e.amount
      ].join('\t'));

      const excelContent = [headers, ...rows].join('\n');
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `fintech-tracker-expenses-${Date.now()}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.showToast('Excel document exported successfully!', 'success');
    } catch (err) {
      toast.showToast('Failed to generate Excel download.', 'error');
    }
  };

  
  const handleExportBackup = async () => {
    try {
      const backupData = await apiRequest('/settings/backup');
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fintech-tracker-backup-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      toast.showToast('JSON database backup exported successfully.', 'success');
    } catch (err) {
      toast.showToast('Error exporting backup.', 'error');
    }
  };

  
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setRestoring(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        let expensesList = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          
          expensesList = parsed.expenses || (Array.isArray(parsed) ? parsed : []);
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n');
          if (lines.length < 2) throw new Error('CSV has no records.');

          const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
          
          const amountIdx = headers.indexOf('amount');
          const categoryIdx = headers.indexOf('category');
          const dateIdx = headers.indexOf('date');
          const descIdx = headers.indexOf('description');

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const cols = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
            
            expensesList.push({
              amount: parseFloat(cols[amountIdx !== -1 ? amountIdx : 3]) || 0,
              category: cols[categoryIdx !== -1 ? categoryIdx : 1] || 'Others',
              date: cols[dateIdx !== -1 ? dateIdx : 0] ? new Date(cols[dateIdx !== -1 ? dateIdx : 0]) : new Date(),
              description: cols[descIdx !== -1 ? descIdx : 2] || ''
            });
          }
        }

        if (!expensesList.length) {
          throw new Error('No valid transactions found in file.');
        }

        const res = await apiRequest('/settings/import', 'POST', { expenses: expensesList });
        toast.showToast(res.message, 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } catch (err) {
        toast.showToast(err.message || 'Import failed. Check formatting.', 'error');
        setRestoring(false);
      }
    };

    reader.readAsText(file);
  };

  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
                <Camera className="text-neonBlue" size={16} />
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Profile Photo</h4>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-neonBlue/30 shadow-glass"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neonIndigo to-neonBlue text-white font-bold text-3xl flex items-center justify-center border-4 border-neonBlue/20 shadow-glass">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                      <Loader className="animate-spin text-neonBlue" size={24} />
                    </div>
                  )}
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <span className="block text-xs font-bold text-textPrimary">Upload Profile Avatar</span>
                  <span className="block text-[10px] text-textMuted max-w-sm">
                    Recommended dimensions: 250x250px. Formats: JPEG, PNG, GIF. Max file size: 2MB.
                  </span>
                  <label className="glass-btn-primary py-2 px-4 text-xs cursor-pointer inline-flex items-center gap-2">
                    <Upload size={12} />
                    <span>Upload New Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
              </div>
            </div>

            
            <form onSubmit={handleSaveBasic} className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
                <User className="text-neonIndigo" size={16} />
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Profile Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Display Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="glass-input py-2 px-3 text-xs w-full" 
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="glass-input py-2 px-3 text-xs w-full" 
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={savingBasic} 
                className="glass-btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5"
              >
                {savingBasic && <Loader className="animate-spin" size={12} />}
                <span>Save Basic Details</span>
              </button>
            </form>

            
            <form onSubmit={handleSavePassword} className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
                <Lock className="text-neonRose" size={16} />
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Security Password</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    className="glass-input py-2 px-3 text-xs w-full" 
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    className="glass-input py-2 px-3 text-xs w-full" 
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    className="glass-input py-2 px-3 text-xs w-full" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={savingPassword} 
                className="glass-btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5 bg-gradient-to-tr from-neonRose to-rose-600"
              >
                {savingPassword && <Loader className="animate-spin" size={12} />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        );

      case 'preferences':
        return (
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
              <Palette className="text-neonBlue" size={16} />
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Visual & Layout Preferences</h4>
            </div>

            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-glassBorder/10 pb-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary">Appearance Theme</label>
                  <p className="text-[10px] text-textSecondary">Select dark or light application view.</p>
                </div>
                <CustomSelect
                  value={theme}
                  onChange={setTheme}
                  options={themeOptions}
                  className="w-full sm:w-60"
                />
              </div>

              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-glassBorder/10 pb-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary">Display Currency</label>
                  <p className="text-[10px] text-textSecondary">Set default system currency symbol.</p>
                </div>
                <CustomSelect
                  value={currency}
                  onChange={setCurrency}
                  options={currencyOptions}
                  className="w-full sm:w-60"
                />
              </div>

              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-glassBorder/10 pb-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary">App Language</label>
                  <p className="text-[10px] text-textSecondary">Choose system-wide default display language.</p>
                </div>
                <CustomSelect
                  value={language}
                  onChange={setLanguage}
                  options={languageOptions}
                  className="w-full sm:w-60"
                />
              </div>

              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
                <div>
                  <label className="text-xs font-bold text-textPrimary">Date Format</label>
                  <p className="text-[10px] text-textSecondary">Choose format for date representation.</p>
                </div>
                <CustomSelect
                  value={dateFormat}
                  onChange={setDateFormat}
                  options={dateFormatOptions}
                  className="w-full sm:w-60"
                />
              </div>

              <button 
                onClick={handleSavePreferences} 
                disabled={savingPreferences}
                className="glass-btn-primary py-2 px-4 text-xs w-full justify-center"
              >
                {savingPreferences && <Loader className="animate-spin" size={12} />}
                <span>Save preferences</span>
              </button>
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
              <Coins className="text-neonAmber" size={16} />
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Expense & Budgeting Settings</h4>
            </div>

            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-glassBorder/10 pb-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary">Default Category</label>
                  <p className="text-[10px] text-textSecondary">Default category when creating a transaction.</p>
                </div>
                <CustomSelect
                  value={defaultCategory}
                  onChange={setDefaultCategory}
                  options={categoryOptions}
                  className="w-full sm:w-60"
                />
              </div>

              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-glassBorder/10 pb-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary">Monthly Budget Limit</label>
                  <p className="text-[10px] text-textSecondary">Your overarching monthly expense threshold.</p>
                </div>
                <div className="w-full sm:w-60 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-textSecondary font-bold">₹</span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={e => setMonthlyBudget(e.target.value)}
                    className="glass-input pl-7.5 pr-4 py-2.5 text-xs w-full font-bold"
                    placeholder="Enter limit"
                  />
                </div>
              </div>

              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-glassBorder/10 pb-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary">Budget Alert Threshold</label>
                  <p className="text-[10px] text-textSecondary">Notify when spending hits this percentage of budget.</p>
                </div>
                <CustomSelect
                  value={budgetAlertPercentage}
                  onChange={setBudgetAlertPercentage}
                  options={alertPercentageOptions}
                  className="w-full sm:w-60"
                />
              </div>

              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
                <div>
                  <label className="text-xs font-bold text-textPrimary">Default Payment Method</label>
                  <p className="text-[10px] text-textSecondary">Selected automatically during checkout logs.</p>
                </div>
                <CustomSelect
                  value={defaultPaymentMethod}
                  onChange={setDefaultPaymentMethod}
                  options={paymentMethodOptions}
                  className="w-full sm:w-60"
                />
              </div>

              <button 
                onClick={handleSaveExpenseSettings} 
                disabled={savingExpense}
                className="glass-btn-primary py-2.5 px-4 text-xs w-full justify-center bg-gradient-to-tr from-neonAmber to-amber-600"
              >
                {savingExpense && <Loader className="animate-spin" size={12} />}
                <span>Save Expense Configurations</span>
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
              <Bell className="text-neonEmerald" size={16} />
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Alerting & Notification Settings</h4>
            </div>

            <div className="space-y-5.5">
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-textPrimary block">Budget Exceeded Alerts</label>
                  <span className="text-[10px] text-textSecondary">Send immediate alerts when budget limits are breached.</span>
                </div>
                <input
                  type="checkbox"
                  checked={budgetExceededAlerts}
                  onChange={e => setBudgetExceededAlerts(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 cursor-pointer"
                />
              </div>

              
              <div className="flex items-center justify-between border-t border-glassBorder/10 pt-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary block">Monthly Expense Summary</label>
                  <span className="text-[10px] text-textSecondary">Compile and display a summary at the end of the billing cycle.</span>
                </div>
                <input
                  type="checkbox"
                  checked={monthlyExpenseSummary}
                  onChange={e => setMonthlyExpenseSummary(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 cursor-pointer"
                />
              </div>

              
              <div className="flex items-center justify-between border-t border-glassBorder/10 pt-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary block">Savings Goal Reminders</label>
                  <span className="text-[10px] text-textSecondary">Send triggers when savings targets are lagging or updated.</span>
                </div>
                <input
                  type="checkbox"
                  checked={savingsGoalReminders}
                  onChange={e => setSavingsGoalReminders(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 cursor-pointer"
                />
              </div>

              
              <div className="flex items-center justify-between border-t border-glassBorder/10 pt-4 pb-2">
                <div>
                  <label className="text-xs font-bold text-textPrimary block">Email Notifications</label>
                  <span className="text-[10px] text-textSecondary">Receive transaction statements and highlights in your inbox.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={e => setEmailNotifications(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 cursor-pointer"
                />
              </div>

              <button 
                onClick={handleSaveNotifications} 
                disabled={savingNotifications}
                className="glass-btn-primary py-2.5 px-4 text-xs w-full justify-center bg-gradient-to-tr from-neonEmerald to-emerald-600"
              >
                {savingNotifications && <Loader className="animate-spin" size={12} />}
                <span>Save Notification Settings</span>
              </button>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
                <Download className="text-neonBlue" size={16} />
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Export Financial Ledger</h4>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed">
                Download your entire logged transaction logs in standard formats for analysis, audits, or migrations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={exportCSV}
                  className="glass-btn-secondary py-3 text-xs w-full flex items-center justify-center gap-2 font-bold bg-slate-900/10 border border-slate-800"
                >
                  <FileText size={14} className="text-neonBlue" />
                  <span>Export CSV Log</span>
                </button>
                <button
                  onClick={exportExcel}
                  className="glass-btn-secondary py-3 text-xs w-full flex items-center justify-center gap-2 font-bold bg-slate-900/10 border border-slate-800"
                >
                  <FileSpreadsheet size={14} className="text-neonEmerald" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={exportPDF}
                  className="glass-btn-secondary py-3 text-xs w-full flex items-center justify-center gap-2 font-bold bg-slate-900/10 border border-slate-800"
                >
                  <FileText size={14} className="text-neonRose" />
                  <span>Export PDF Summary</span>
                </button>
              </div>
            </div>

            
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
                <Upload className="text-neonEmerald" size={16} />
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Import & Restore Transactions</h4>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed">
                Import expenses directly from a standard CSV table or a previously saved FintechTracker JSON backup file.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <label className="glass-btn-secondary py-3.5 text-xs w-full flex items-center justify-center gap-2 cursor-pointer border border-dashed border-slate-700/60 bg-slate-900/10 font-bold">
                  {restoring ? <Loader className="animate-spin" size={14} /> : <Upload size={14} className="text-neonEmerald" />}
                  <span>Import CSV / JSON file</span>
                  <input 
                    type="file" 
                    accept=".json,.csv" 
                    onChange={handleImportFile} 
                    className="hidden" 
                    disabled={restoring}
                  />
                </label>

                
                <button
                  onClick={handleExportBackup}
                  className="glass-btn-primary py-3.5 text-xs w-full flex items-center justify-center gap-2 font-bold bg-gradient-to-tr from-neonIndigo to-indigo-600"
                >
                  <Database size={14} />
                  <span>Backup Database (JSON)</span>
                </button>
              </div>
            </div>

            
            <div className="glass-card p-6 space-y-5 border border-red-500/20">
              <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
                <AlertTriangle className="text-red-400" size={16} />
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Destructive Actions Zone</h4>
              </div>
              <p className="text-xs text-red-200/60 leading-relaxed">
                This action is irreversible. All expense transaction history, monthly budget parameters, savings targets, and earned achievement medals will be permanently cleared from the servers.
              </p>
              <button
                onClick={handleClearAllData}
                disabled={destructiveLoading}
                className="glass-btn-danger py-3 text-xs w-full flex items-center justify-center gap-2 bg-red-950/20 border border-red-800 text-red-400 hover:bg-red-800 hover:text-white"
              >
                {destructiveLoading ? <Loader className="animate-spin" size={14} /> : <Trash2 size={14} />}
                <span>Clear Database Records</span>
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
                <ShieldAlert className="text-neonRose" size={16} />
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Access Security & Session Preferences</h4>
              </div>

              <div className="space-y-5">
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-textPrimary block">Two-Factor Authentication (2FA)</label>
                    <span className="text-[10px] text-textSecondary">Provide code check on new account signups or logins.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={e => setTwoFactorAuth(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 cursor-pointer"
                  />
                </div>

                
                <div className="flex items-center justify-between border-t border-glassBorder/10 pt-4 pb-2">
                  <div>
                    <span className="text-xs font-bold text-textPrimary block">Logout from All Devices</span>
                    <span className="text-[10px] text-textSecondary">Terminate sessions on all other desktop or mobile logins.</span>
                  </div>
                  <button
                    onClick={handleLogoutAllDevices}
                    className="glass-btn-secondary py-1.5 px-3.5 text-[10px] font-bold flex items-center gap-1.5 hover:bg-slate-800"
                  >
                    <LogOut size={12} />
                    <span>Logout All</span>
                  </button>
                </div>

                <button 
                  onClick={handleSaveSecurity} 
                  disabled={savingSecurity}
                  className="glass-btn-primary py-2 px-4 text-xs w-full justify-center bg-gradient-to-tr from-neonRose to-rose-600"
                >
                  {savingSecurity && <Loader className="animate-spin" size={12} />}
                  <span>Enforce Security Profile</span>
                </button>
              </div>
            </div>

            
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
                <Brain className="text-neonBlue" size={16} />
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">AI Financial Features</h4>
              </div>

              <div className="space-y-5">
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-textPrimary block">AI Spending Insights</label>
                    <span className="text-[10px] text-textSecondary">Automated insights detailing spending trends on dashboard.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiSpendingInsights}
                    onChange={e => setAiSpendingInsights(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 cursor-pointer"
                  />
                </div>

                
                <div className="flex items-center justify-between border-t border-glassBorder/10 pt-4">
                  <div>
                    <label className="text-xs font-bold text-textPrimary block">Smart Expense Categorization</label>
                    <span className="text-[10px] text-textSecondary">Auto-detect categories using NLP model on transaction text descriptions.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smartExpenseCategorization}
                    onChange={e => setSmartExpenseCategorization(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 cursor-pointer"
                  />
                </div>

                
                <div className="flex items-center justify-between border-t border-glassBorder/10 pt-4 pb-2">
                  <div>
                    <label className="text-xs font-bold text-textPrimary block">Weekly Financial Recommendations</label>
                    <span className="text-[10px] text-textSecondary">Custom budgeting tips sent to notifications inbox based on weekly logs.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyFinancialRecommendations}
                    onChange={e => setWeeklyFinancialRecommendations(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 cursor-pointer"
                  />
                </div>

                <button 
                  onClick={handleSaveSecurity} 
                  disabled={savingSecurity}
                  className="glass-btn-primary py-2.5 px-4 text-xs w-full justify-center bg-gradient-to-tr from-neonBlue to-blue-600"
                >
                  {savingSecurity && <Loader className="animate-spin" size={12} />}
                  <span>Save AI Configuration</span>
                </button>
              </div>
            </div>

            
            <div className="glass-card p-6 space-y-5 border border-red-500/20">
              <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
                <Trash2 className="text-red-400" size={16} />
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider font-extrabold">Account Deletion Zone</h4>
              </div>
              <p className="text-xs text-red-200/60 leading-relaxed font-medium">
                This is a destructive action. Your user credentials, profiles, database documents, and login authorization entries will be permanently deleted from our servers.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={destructiveLoading}
                className="glass-btn-danger py-3 text-xs w-full flex items-center justify-center gap-2 bg-red-950/20 border border-red-800 text-red-400 hover:bg-red-800 hover:text-white"
              >
                {destructiveLoading ? <Loader className="animate-spin" size={14} /> : <Trash2 size={14} />}
                <span>Delete Account Permanently</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          {photoPreview ? (
            <img 
              src={photoPreview} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full object-cover border-2 border-neonBlue/30 shadow-glass shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-neonIndigo to-neonBlue text-white font-bold text-xl flex items-center justify-center border-2 border-neonBlue/20 shadow-glass shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-textPrimary">{user?.name}</h2>
            <p className="text-xs text-textSecondary mt-0.5">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="text-[9px] bg-neonBlue/10 text-neonBlue border border-neonBlue/20 rounded-md px-2 py-0.5 font-bold uppercase tracking-wider">
                {user?.preferences?.theme || 'dark'} mode
              </span>
              <span className="text-[9px] bg-neonIndigo/10 text-neonIndigo border border-neonIndigo/20 rounded-md px-2 py-0.5 font-bold uppercase tracking-wider">
                {user?.preferences?.currency || 'INR'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to log out?')) logout();
          }}
          className="glass-btn-secondary py-2.5 px-4 text-xs flex items-center gap-2 border border-slate-700 bg-slate-900/10 font-bold hover:bg-slate-800 cursor-pointer"
        >
          <LogOut size={14} className="text-neonRose" />
          <span>Logout Session</span>
        </button>
      </div>

      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        
        <div className="w-full md:w-64 flex-shrink-0 space-y-1 bg-slate-900/10 p-2 rounded-2xl border border-glassBorder/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-bold tracking-wider transition-all uppercase cursor-pointer border
                  ${isActive 
                    ? 'bg-gradient-to-tr from-neonIndigo to-neonBlue text-white shadow-lg shadow-neonBlue/15 border-neonBlue/30' 
                    : 'text-textSecondary hover:bg-slate-800/40 hover:text-textPrimary border-transparent'
                  }
                `}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-textMuted'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default Settings;
