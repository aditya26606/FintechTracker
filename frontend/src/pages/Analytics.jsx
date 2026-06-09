import React, { useState, useEffect } from 'react';
import apiRequest from '../api';
import { useToast } from '../context/ToastContext';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
  TrendingUp, 
  Brain, 
  Lightbulb, 
  Compass, 
  Loader, 
  ArrowUpRight, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiRequest('/analytics/insights');
        setAnalytics(data);
      } catch (err) {
        toast.showToast('Failed to compute analytics insights.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analytics || !analytics.hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-glassBorder flex items-center justify-center text-textMuted">
          <Brain size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-textPrimary">Insufficient Ledger Data</h3>
          <p className="text-xs text-textMuted max-w-sm">
            Please log a few expenses under the Expense Tracker to enable our AI analytics engine.
          </p>
        </div>
      </div>
    );
  }

  const { highestCategory, categoryBreakdown, monthlyTrends, predictions, insights, recommendations } = analytics;

  
  const trendKeys = Object.keys(monthlyTrends || {});
  const trendVals = Object.values(monthlyTrends || {});
  const lineChartData = {
    labels: trendKeys,
    datasets: [{
      label: 'Monthly Trend (₹)',
      data: trendVals,
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.05)',
      borderWidth: 2.5,
      tension: 0.3,
      fill: true,
      pointBackgroundColor: '#6366f1',
      pointRadius: 4
    }]
  };

  
  const catKeys = Object.keys(categoryBreakdown || {});
  const catVals = Object.values(categoryBreakdown || {});
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
    labels: catKeys,
    datasets: [{
      data: catVals,
      backgroundColor: catKeys.map(k => categoryColors[k] || '#64748b'),
      borderColor: '#0b0f19',
      borderWidth: 1.5
    }]
  };

  
  const barChartData = {
    labels: catKeys,
    datasets: [{
      label: 'Category Total (₹)',
      data: catVals,
      backgroundColor: catKeys.map(k => `${categoryColors[k] || '#64748b'}b0`),
      borderColor: catKeys.map(k => categoryColors[k] || '#64748b'),
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Outfit', size: 9 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#64748b', font: { family: 'Outfit', size: 9 } }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      
      <div className="p-6 glass-card bg-gradient-to-r from-slate-950 via-slate-900/40 to-slate-950 border border-neonBlue/15 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-neonIndigo/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-neonBlue/10 text-neonBlue border border-neonBlue/15 shadow-glow-blue/10">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              Predictive Expense Forecast
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed max-w-md">
              Based on your monthly transaction frequency and historical burn rate, we have generated your budget forecast.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10 w-full md:w-auto justify-between md:justify-end border-t border-glassBorder/40 md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider block">Average Monthly Spent</span>
            <span className="text-lg font-bold text-textSecondary">₹{predictions.averageMonthlyBurn.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neonBlue uppercase font-bold tracking-wider block">Next Month Forecast</span>
            <span className="text-2xl font-black text-neonBlue">₹{predictions.nextMonthForecast.toLocaleString()}</span>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Historical Spend Trends</h4>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        
        <div className="glass-card p-6 space-y-4">
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Category Contribution</h4>
          <div className="h-64 relative flex items-center justify-center">
            <Doughnut data={doughnutChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit', size: 9 } } } }
            }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Category-wise comparison</h4>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        
        <div className="space-y-6 lg:col-span-1">
          
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
              <Brain className="text-neonBlue" size={16} />
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">AI Intelligent Insights</h4>
            </div>

            <div className="space-y-3">
              {insights.map((ins, idx) => {
                let statusBorder = 'border-neonBlue/15 bg-slate-900/30';
                let indicatorColor = 'text-neonBlue';
                if (ins.type === 'danger') {
                  statusBorder = 'border-neonRose/20 bg-neonRose/5';
                  indicatorColor = 'text-neonRose';
                } else if (ins.type === 'warning') {
                  statusBorder = 'border-neonAmber/20 bg-neonAmber/5';
                  indicatorColor = 'text-neonAmber';
                } else if (ins.type === 'success') {
                  statusBorder = 'border-neonEmerald/20 bg-neonEmerald/5';
                  indicatorColor = 'text-neonEmerald';
                }

                return (
                  <div key={idx} className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${statusBorder}`}>
                    <span className={`font-bold block ${indicatorColor}`}>{ins.title}</span>
                    <p className="text-textSecondary">{ins.message}</p>
                  </div>
                );
              })}
            </div>
          </div>

          
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
              <Lightbulb className="text-neonAmber" size={16} />
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Budget Recommendations</h4>
            </div>

            <ul className="space-y-3.5 pl-1">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-textSecondary flex items-start gap-2.5 leading-relaxed">
                  <span className="p-1 rounded bg-neonAmber/10 text-neonAmber font-bold mt-0.5">💡</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
