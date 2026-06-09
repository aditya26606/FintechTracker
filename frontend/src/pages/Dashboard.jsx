import React, { useEffect, useState, useCallback } from 'react';
import apiRequest from '../api';
import { useAuth } from '../context/AuthContext';

import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  DollarSign,
  PiggyBank,
  ChevronRight,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES_CONFIG } from '../components/CategoryConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const RANGE_OPTIONS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'last3months', label: '3 Months' },
  { key: 'last6months', label: '6 Months' },
  { key: 'last1year', label: '1 Year' },
  { key: 'alltime', label: 'All Time' },
];


const RangePill = ({ option, active, onClick }) => (
  <button
    id={`trend-filter-${option.key}`}
    onClick={() => onClick(option.key)}
    style={{
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '10px',
      fontWeight: 600,
      fontFamily: 'Outfit, Inter, sans-serif',
      letterSpacing: '0.04em',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.07)',
      background: active
        ? 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(56,189,248,0.25))'
        : 'rgba(15,23,42,0.45)',
      color: active ? '#f8fafc' : '#64748b',
      boxShadow: active ? '0 0 10px rgba(99,102,241,0.3)' : 'none',
      transform: active ? 'scale(1.05)' : 'scale(1)',
      whiteSpace: 'nowrap',
    }}
  >
    {option.label}
  </button>
);

const Dashboard = () => {
  const { user } = useAuth();
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  const currencySymbol = currencySymbols[user?.preferences?.currency] || '₹';

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    expenses: [],
    budget: null,
    goals: [],
    insights: null
  });

  
  const [trendRange, setTrendRange] = useState('monthly');
  const [trendData, setTrendData] = useState({ labels: [], data: [] });
  const [trendLoading, setTrendLoading] = useState(false);
  const [chartVisible, setChartVisible] = useState(true);

  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [expenses, budget, goals, insights] = await Promise.all([
          apiRequest('/expenses'),
          apiRequest('/budgets'),
          apiRequest('/goals'),
          apiRequest('/analytics/insights')
        ]);
        setDashboardData({ expenses, budget, goals, insights });
      } catch (err) {
        console.error('Error fetching dashboard datasets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  
  const fetchTrend = useCallback(async (range) => {
    setChartVisible(false);
    setTrendLoading(true);
    try {
      const result = await apiRequest(`/analytics/expense-trend?range=${range}`);
      if (result && Array.isArray(result.labels) && result.labels.length > 0) {
        setTrendData({ labels: result.labels, data: result.data });
      } else {
        setTrendData({ labels: [], data: [] });
      }
    } catch (err) {
      console.error('Trend fetch error:', err);
      setTrendData({ labels: [], data: [] });
    } finally {
      setTrendLoading(false);
      
      setTimeout(() => setChartVisible(true), 80);
    }
  }, []);

  useEffect(() => {
    fetchTrend(trendRange);
  }, [trendRange, fetchTrend]);

  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { expenses, budget, goals, insights } = dashboardData;

  
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyLimit = budget ? budget.monthlyBudget : 0;
  const remainingBudget = Math.max(0, monthlyLimit - totalSpent);
  const budgetPercentage = monthlyLimit > 0 ? (totalSpent / monthlyLimit) * 100 : 0;
  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  
  const lineChartData = {
    labels: trendData.labels.length > 0 ? trendData.labels : ['No data'],
    datasets: [{
      label: `Expenses (${currencySymbol})`,
      data: trendData.data.length > 0 ? trendData.data : [0],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#38bdf8',
      pointBorderColor: '#090d16',
      pointRadius: trendData.labels.length > 20 ? 2 : 5,
      pointHoverRadius: 7,
    }]
  };

  
  const catKeys = insights && insights.categoryBreakdown ? Object.keys(insights.categoryBreakdown) : [];
  const catVals = insights && insights.categoryBreakdown ? Object.values(insights.categoryBreakdown) : [];

  const categoryColors = {
    Food: '#f43f5e',
    Travel: '#38bdf8',
    Bills: '#f59e0b',
    Entertainment: '#a855f7',
    Healthcare: '#10b981',
    Education: '#06b6d4',
    Shopping: '#ec4899',
    Others: '#64748b'
  };

  const doughnutChartData = {
    labels: catKeys.length > 0 ? catKeys : ['No Expenses'],
    datasets: [{
      data: catVals.length > 0 ? catVals : [1],
      backgroundColor: catKeys.length > 0 ? catKeys.map(k => categoryColors[k] || '#64748b') : ['#334155'],
      borderColor: '#0f172a',
      borderWidth: 2,
    }]
  };

  
  const goalNames = goals.map(g => g.goalName);
  const goalCurrents = goals.map(g => g.currentAmount);
  const goalTargets = goals.map(g => g.targetAmount);

  const barChartData = {
    labels: goalNames.length > 0 ? goalNames : ['No Goals'],
    datasets: [
      {
        label: `Saved (${currencySymbol})`,
        data: goalCurrents.length > 0 ? goalCurrents : [0],
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: `Target (${currencySymbol})`,
        data: goalTargets.length > 0 ? goalTargets : [0],
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeInOutQuart' },
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.92)',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        padding: 10,
        cornerRadius: 10,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Outfit', size: 10 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Outfit', size: 10 } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
      }
    }
  };

  
  const rangeLabel = RANGE_OPTIONS.find(r => r.key === trendRange)?.label || 'Monthly';

  return (
    <div className="space-y-6">

      
      {budgetPercentage >= 100 && (
        <div className="p-4 rounded-xl border border-neonRose/20 bg-neonRose/10 text-xs font-semibold text-neonRose flex items-center gap-3">
          <AlertTriangle className="animate-bounce" size={18} />
          <span>Danger: You have exceeded your monthly budget allowance limit! (Spent: {budgetPercentage.toFixed(0)}%)</span>
        </div>
      )}
      {budgetPercentage >= 80 && budgetPercentage < 100 && (
        <div className="p-4 rounded-xl border border-neonAmber/20 bg-neonAmber/10 text-xs font-semibold text-neonAmber flex items-center gap-3">
          <AlertTriangle size={18} />
          <span>Warning: You have used {budgetPercentage.toFixed(0)}% of your monthly budget limit.</span>
        </div>
      )}

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        
        <div className="glass-card p-6 flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Expenses</span>
            <h3 className="text-2xl font-bold text-textPrimary">{currencySymbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="text-[10px] text-textMuted">{expenses.length} transaction{expenses.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-3 rounded-xl bg-neonRose/10 text-neonRose border border-neonRose/15 shadow-inner">
            <TrendingUp size={20} />
          </div>
        </div>

        
        <div className="glass-card p-6 glass-card-hover flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Monthly Budget</span>
              <h3 className="text-2xl font-bold text-textPrimary">{currencySymbol}{monthlyLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 rounded-xl bg-neonIndigo/10 text-neonIndigo border border-neonIndigo/15 shadow-inner">
              <CreditCard size={20} />
            </div>
          </div>
          
          {monthlyLimit > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-textMuted">
                <span>Used {budgetPercentage.toFixed(0)}%</span>
                <span>{currencySymbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    budgetPercentage >= 100 ? 'progress-danger' :
                    budgetPercentage >= 80  ? 'progress-warning' : 'progress-success'
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        
        <div className="glass-card p-6 flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Remaining Budget</span>
            <h3 className={`text-2xl font-bold ${remainingBudget <= 0 ? 'text-neonRose' : 'text-neonBlue'}`}>
              {currencySymbol}{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-textMuted">
              {monthlyLimit > 0 ? `${(100 - Math.min(budgetPercentage, 100)).toFixed(0)}% available` : 'No budget set'}
            </span>
          </div>
          <div className={`p-3 rounded-xl border shadow-inner ${remainingBudget <= 0 ? 'bg-neonRose/10 text-neonRose border-neonRose/15' : 'bg-neonBlue/10 text-neonBlue border-neonBlue/15'}`}>
            <TrendingDown size={20} />
          </div>
        </div>

        
        <div className="glass-card p-6 flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Savings</span>
            <h3 className="text-2xl font-bold text-neonEmerald">{currencySymbol}{totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="text-[10px] text-textMuted">{goals.length} active goal{goals.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-3 rounded-xl bg-neonEmerald/10 text-neonEmerald border border-neonEmerald/15 shadow-inner">
            <PiggyBank size={20} />
          </div>
        </div>

      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-neonIndigo" />
              <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">
                Expense Trend
              </h4>
              {trendLoading && (
                <div className="w-3 h-3 border-2 border-neonBlue border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                alignItems: 'center',
              }}
            >
              {RANGE_OPTIONS.map((opt) => (
                <RangePill
                  key={opt.key}
                  option={opt}
                  active={trendRange === opt.key}
                  onClick={setTrendRange}
                />
              ))}
            </div>
          </div>

          
          <div
            className="h-64"
            style={{
              opacity: chartVisible ? 1 : 0,
              transform: chartVisible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
          >
            {trendData.labels.length === 0 && !trendLoading ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-textMuted italic">No expense data for this range</span>
              </div>
            ) : (
              <Line data={lineChartData} options={chartOptions} />
            )}
          </div>

          
          <p style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', marginTop: '-8px' }}>
            Showing: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{rangeLabel}</span> view
          </p>
        </div>

        
        <div className="glass-card p-6 space-y-4">
          <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Category Breakdown</h4>
          <div className="h-64 relative flex items-center justify-center">
            {catKeys.length > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            ) : (
              <span className="text-xs text-textMuted italic">No transaction data available</span>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Savings Goals Completion</h4>
            <Link to="/goals" className="text-xs text-neonBlue hover:underline flex items-center gap-1">
              Add Goal <ChevronRight size={14} />
            </Link>
          </div>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Recent Transactions</h4>
              <Link to="/expenses" className="text-xs text-neonBlue hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {expenses.length > 0 ? (
                expenses.slice(0, 4).map((e) => {
                  const catConfig = CATEGORIES_CONFIG[e.category] || CATEGORIES_CONFIG.Others;
                  const IconComp = catConfig.icon;
                  return (
                    <div key={e._id || e.id} className="flex items-center justify-between p-3 rounded-xl border border-glassBorder hover:border-slate-800 bg-slate-950/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${catConfig.bg} ${catConfig.color} border ${catConfig.border} ${catConfig.glow}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-textPrimary">{e.description || e.category}</h5>
                          <span className="text-[10px] text-textMuted">
                            {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • <span className={`${catConfig.color} font-bold`}>{e.category}</span>
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-neonRose">-₹{e.amount.toLocaleString()}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-xs text-textMuted italic">No transactions recorded yet</div>
              )}
            </div>
          </div>

          <Link to="/expenses" className="glass-btn-secondary py-2 text-xs w-full text-center">
            Log New Expense
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
