import React, { useState, useEffect } from 'react';
import apiRequest from '../api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  PiggyBank, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  Loader, 
  ChevronRight, 
  X,
  PlusCircle
} from 'lucide-react';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  
  const [activeFundGoal, setActiveFundGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/goals');
      setGoals(data);
    } catch (err) {
      toast.showToast('Failed to load savings goals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const resetForm = () => {
    setEditingGoal(null);
    setGoalName('');
    setTargetAmount('');
    setTargetDate('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowGoalModal(true);
  };

  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setGoalName(goal.goalName);
    setTargetAmount(goal.targetAmount.toString());
    setTargetDate(new Date(goal.targetDate).toISOString().split('T')[0]);
    setShowGoalModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !targetDate) {
      toast.showToast('Please fill all mandatory fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        goalName,
        targetAmount: parseFloat(targetAmount),
        targetDate
      };

      if (editingGoal) {
        await apiRequest(`/goals/${editingGoal._id || editingGoal.id}`, 'PUT', payload);
        toast.showToast('Savings goal updated successfully!', 'success');
      } else {
        await apiRequest('/goals', 'POST', payload);
        toast.showToast('Savings goal created successfully!', 'success');
      }

      setShowGoalModal(false);
      resetForm();
      fetchGoals();
    } catch (err) {
      toast.showToast('Error saving savings goal.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal? This action cannot be undone.')) return;

    try {
      await apiRequest(`/goals/${id}`, 'DELETE');
      toast.showToast('Savings goal deleted.', 'warning');
      fetchGoals();
    } catch (err) {
      toast.showToast('Failed to delete goal.', 'error');
    }
  };

  const handleFundContribution = async (e) => {
    e.preventDefault();
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;

    try {
      const amount = parseFloat(fundAmount);
      const updated = await apiRequest(`/goals/${activeFundGoal._id || activeFundGoal.id}/fund`, 'PUT', { amount });
      
      toast.showToast(`Contributed ₹${amount.toLocaleString()} to ${activeFundGoal.goalName}!`, 'success');
      
      
      if (updated.currentAmount >= updated.targetAmount) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        toast.showToast(`🎉 Congratulations! You achieved your savings goal: ${activeFundGoal.goalName}!`, 'success');
      }

      setFundAmount('');
      setActiveFundGoal(null);
      fetchGoals();
    } catch (err) {
      toast.showToast('Error funding savings goal.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      
      <div className="flex items-center justify-between p-4 glass-card">
        <div className="flex items-center gap-2 text-textSecondary">
          <PiggyBank className="text-neonBlue" size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Configure Financial Targets</span>
        </div>
        <button onClick={handleOpenAddModal} className="glass-btn-primary py-2 px-4 text-sm">
          <Plus size={16} />
          <span>New Savings Target</span>
        </button>
      </div>

      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-neonBlue" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length > 0 ? (
            goals.map(goal => {
              const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isAchieved = goal.currentAmount >= goal.targetAmount;
              
              return (
                <div 
                  key={goal._id || goal.id} 
                  className={`glass-card p-6 flex flex-col justify-between relative overflow-hidden glass-card-hover border
                    ${isAchieved ? 'border-neonEmerald/40 shadow-glow-emerald/10' : 'border-glassBorder/60'}
                  `}
                >
                  {isAchieved && (
                    <div className="absolute top-2 right-2 text-neonEmerald animate-pulse">
                      <CheckCircle2 size={18} />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-textPrimary truncate">{goal.goalName}</h4>
                      <div className="flex items-center gap-1.5 text-textMuted text-xs font-semibold">
                        <Calendar size={12} />
                        <span>Deadline: {new Date(goal.targetDate).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}</span>
                      </div>
                    </div>

                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-textSecondary">
                        <span>₹{goal.currentAmount.toLocaleString()} saved</span>
                        <span>Target: ₹{goal.targetAmount.toLocaleString()}</span>
                      </div>

                      
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 
                            ${isAchieved ? 'bg-gradient-to-r from-neonEmerald to-emerald-400' : 'bg-gradient-to-r from-neonIndigo to-neonBlue'}
                          `}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-bold text-textMuted uppercase tracking-wider">
                        <span>{percent.toFixed(0)}% Completed</span>
                        <span className={isAchieved ? 'text-neonEmerald' : 'text-neonBlue'}>
                          {isAchieved ? 'Achieved!' : `₹${Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString()} left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  
                  <div className="mt-6 pt-4 border-t border-glassBorder/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(goal)}
                        className="p-2 text-textSecondary hover:text-neonBlue rounded-xl hover:bg-slate-800/40 transition-colors"
                        title="Edit goal"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(goal._id || goal.id)}
                        className="p-2 text-textSecondary hover:text-neonRose rounded-xl hover:bg-slate-800/40 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {!isAchieved && (
                      <button 
                        onClick={() => setActiveFundGoal(goal)}
                        className="glass-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                      >
                        <PlusCircle size={14} />
                        <span>Fund Goal</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 text-textMuted italic bg-slate-900/10 rounded-2xl border border-glassBorder/40">
              No savings targets declared. Open the form above to add laptop, emergency, or vacation funds!
            </div>
          )}
        </div>
      )}

      
      {showGoalModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md overflow-hidden border border-glassBorder">
            <div className="flex items-center justify-between p-6 border-b border-glassBorder bg-slate-900/30">
              <h3 className="text-base font-bold text-textPrimary uppercase tracking-wider">
                {editingGoal ? 'Modify Savings Target' : 'Create Savings Target'}
              </h3>
              <button onClick={() => setShowGoalModal(false)} className="text-textSecondary hover:text-textPrimary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Goal Name *</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="E.g. Laptop Fund, Emergency Fund"
                  className="glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Target Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="50000"
                    className="glass-input text-sm font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Deadline *</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="glass-input text-sm text-textSecondary"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-glassBorder">
                <button 
                  type="button" 
                  onClick={() => setShowGoalModal(false)}
                  className="glass-btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="glass-btn-primary py-2 px-4 text-xs"
                >
                  {submitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {activeFundGoal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm overflow-hidden border border-glassBorder">
            <div className="flex items-center justify-between p-6 border-b border-glassBorder bg-slate-900/30">
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Fund Target: {activeFundGoal.goalName}
              </h3>
              <button onClick={() => setActiveFundGoal(null)} className="text-textSecondary hover:text-textPrimary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFundContribution} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Contribution Amount (₹) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="500"
                  className="glass-input text-base font-bold text-textPrimary"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-glassBorder">
                <button 
                  type="button" 
                  onClick={() => setActiveFundGoal(null)}
                  className="glass-btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="glass-btn-primary py-2 px-4 text-xs"
                >
                  Contribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SavingsGoals;
