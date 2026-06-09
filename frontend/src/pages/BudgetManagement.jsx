import React, { useState, useEffect } from 'react';
import apiRequest from '../api';
import { useToast } from '../context/ToastContext';
import { Wallet, Settings2, ShieldCheck, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { CATEGORIES_CONFIG } from '../components/CategoryConfig';

const BudgetManagement = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [expenses, setExpenses] = useState([]);
  const toast = useToast();

  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Others'];

  const fetchBudgetAndExpenses = async () => {
    setLoading(true);
    try {
      const [budgetData, expensesData] = await Promise.all([
        apiRequest('/budgets'),
        apiRequest('/expenses')
      ]);

      setMonthlyBudget(budgetData.monthlyBudget || 0);
      setCategoryBudgets(budgetData.categoryBudgets || {});
      setExpenses(expensesData);
    } catch (err) {
      toast.showToast('Failed to fetch budget settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetAndExpenses();
  }, []);

  
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const overallPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  
  const categorySpentMap = {};
  categories.forEach(cat => {
    categorySpentMap[cat] = 0;
  });
  expenses.forEach(e => {
    if (categorySpentMap[e.category] !== undefined) {
      categorySpentMap[e.category] += e.amount;
    } else {
      categorySpentMap['Others'] = (categorySpentMap['Others'] || 0) + e.amount;
    }
  });

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updated = await apiRequest('/budgets', 'POST', {
        monthlyBudget,
        categoryBudgets
      });
      setMonthlyBudget(updated.monthlyBudget);
      setCategoryBudgets(updated.categoryBudgets || {});
      toast.showToast('Budget preferences saved successfully!', 'success');
    } catch (err) {
      toast.showToast('Error saving budget configurations.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryLimitChange = (cat, val) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [cat]: val ? parseFloat(val) : 0
    }));
  };

  
  const getProgressColorClass = (percent) => {
    if (percent >= 100) return 'progress-danger';
    if (percent >= 80) return 'progress-warning';
    return 'progress-success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        
        <div className="glass-card p-6 flex flex-col justify-between glass-card-hover">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Set Monthly Limit</span>
            <Wallet className="text-neonIndigo" size={20} />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-textPrimary">₹{monthlyBudget.toLocaleString()}</h3>
            <p className="text-xs text-textMuted mt-1">Configured dynamic limits</p>
          </div>
        </div>

        
        <div className="glass-card p-6 flex flex-col justify-between glass-card-hover">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Spent Overall</span>
            <TrendingUp className="text-neonRose" size={20} />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-neonRose">₹{totalSpent.toLocaleString()}</h3>
            <p className="text-xs text-textMuted mt-1">{overallPercentage.toFixed(0)}% of limit utilized</p>
          </div>
        </div>

        
        <div className="glass-card p-6 flex flex-col justify-between glass-card-hover">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Remaining Allowance</span>
            <ShieldCheck className="text-neonEmerald" size={20} />
          </div>
          <div className="mt-4">
            <h3 className={`text-3xl font-extrabold ${remainingBudget <= 0 ? 'text-neonRose' : 'text-neonEmerald'}`}>
              ₹{remainingBudget.toLocaleString()}
            </h3>
            <p className="text-xs text-textMuted mt-1">Safe-to-spend balance</p>
          </div>
        </div>

      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        
        <div className="glass-card p-6 space-y-6 lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-glassBorder pb-4">
            <Settings2 className="text-neonBlue" size={18} />
            <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Configure Limits</h4>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Overall Monthly Budget (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                placeholder="Limit overall spent"
                className="glass-input font-bold"
              />
            </div>

            
            <div className="space-y-3 pt-3 border-t border-glassBorder/40">
              <h5 className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Category Budgets</h5>
              <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
                {categories.map(cat => {
                  const catConfig = CATEGORIES_CONFIG[cat] || CATEGORIES_CONFIG.Others;
                  const IconComp = catConfig.icon;
                  return (
                    <div key={cat} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`${catConfig.color} p-1.5 rounded-lg bg-slate-950/40 border ${catConfig.border}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-semibold text-textSecondary">{cat}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={categoryBudgets[cat] || ''}
                        onChange={(e) => handleCategoryLimitChange(cat, e.target.value)}
                        placeholder="No limit"
                        className="glass-input py-1.5 text-xs text-right w-full sm:w-28 font-semibold"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="glass-btn-primary w-full py-2.5 text-sm mt-4">
              {submitting ? 'Saving settings...' : 'Apply Budget settings'}
            </button>
          </form>
        </div>

        
        <div className="glass-card p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-glassBorder pb-4">
            <AlertCircle className="text-neonBlue" size={18} />
            <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Real-time Budget progress</h4>
          </div>

          
          <div className="p-4 rounded-2xl bg-slate-900/20 border border-glassBorder/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-textPrimary">Overall Budget Progress</span>
              <span className="text-textSecondary">
                ₹{totalSpent.toLocaleString()} / ₹{monthlyBudget.toLocaleString()} ({overallPercentage.toFixed(0)}%)
              </span>
            </div>
            
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getProgressColorClass(overallPercentage)}`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
            
            {overallPercentage >= 100 && (
              <div className="text-[10px] text-neonRose font-semibold flex items-center gap-1.5 pt-1">
                <Info size={12} />
                <span>Budget limit exceeded! Reduce secondary expenses.</span>
              </div>
            )}
          </div>

          
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Category Limits Utilization</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => {
                const spent = categorySpentMap[cat] || 0;
                const limit = categoryBudgets[cat] || 0;
                const percent = limit > 0 ? (spent / limit) * 100 : 0;
                const remaining = Math.max(0, limit - spent);
                
                const catConfig = CATEGORIES_CONFIG[cat] || CATEGORIES_CONFIG.Others;
                const IconComp = catConfig.icon;

                return (
                  <div key={cat} className={`p-4 rounded-xl border bg-slate-900/10 space-y-2.5 transition-all duration-300 hover:border-slate-800 ${limit > 0 ? (remaining <= 0 ? 'border-rose-500/20' : 'border-glassBorder/40') : 'border-glassBorder/20'}`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`${catConfig.color} p-1 rounded bg-slate-950/40 border ${catConfig.border}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-textPrimary">{cat}</span>
                      </div>
                      <span className="text-[10px] text-textSecondary font-semibold">
                        ₹{spent.toLocaleString()} / {limit > 0 ? `₹${limit.toLocaleString()}` : 'No Limit'}
                      </span>
                    </div>

                    
                    {limit > 0 ? (
                      <>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColorClass(percent)}`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-textMuted font-semibold">
                          <span>{percent.toFixed(0)}% spent</span>
                          <span className={remaining <= 0 ? 'text-neonRose' : 'text-neonEmerald'}>
                            {remaining <= 0 ? 'Limit Exceeded' : `₹${remaining.toLocaleString()} left`}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-textMuted italic pt-1">No spending limits specified</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BudgetManagement;
