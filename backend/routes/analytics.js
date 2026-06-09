const express = require('express');
const router = express.Router();
const dbHelper = require('../config/db-helper');
const auth = require('../middleware/auth');




router.get('/insights', auth, async (req, res) => {
  try {
    const expenses = await dbHelper.find('Expense', { userId: req.user.id });
    const budget = await dbHelper.findOne('Budget', { userId: req.user.id });
    const goals = await dbHelper.find('SavingsGoal', { userId: req.user.id });

    if (expenses.length === 0) {
      return res.json({
        hasData: false,
        insights: [],
        categoryBreakdown: {},
        predictions: { nextMonthForecast: 0 },
        recommendations: ["Log some expenses to generate analytics recommendations."]
      });
    }

    
    const categoryTotals = {};
    let totalSpent = 0;
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      totalSpent += e.amount;
    });

    let highestCategoryName = '';
    let highestCategoryAmount = 0;
    for (const cat in categoryTotals) {
      if (categoryTotals[cat] > highestCategoryAmount) {
        highestCategoryAmount = categoryTotals[cat];
        highestCategoryName = cat;
      }
    }

    
    const monthlyTotals = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (!isNaN(d.getTime())) {
        const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' }); 
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + e.amount;
      }
    });

    
    const monthKeys = Object.keys(monthlyTotals);
    const monthsCount = monthKeys.length || 1;
    const averageMonthlyBurn = totalSpent / monthsCount;
    
    const recentTrendCoef = expenses.length > 5 ? 1.05 : 1.0; 
    const nextMonthForecast = Math.round(averageMonthlyBurn * recentTrendCoef);

    
    const insights = [];
    const recommendations = [];

    
    const highestCatPercent = ((highestCategoryAmount / totalSpent) * 100).toFixed(0);
    insights.push({
      type: 'warning',
      title: `Highest Spending in ${highestCategoryName}`,
      message: `You spent ${highestCatPercent}% of your total budget (₹${highestCategoryAmount.toFixed(2)}) on ${highestCategoryName}. Consider review options.`
    });

    
    if (budget && budget.monthlyBudget > 0) {
      const budgetPercent = (totalSpent / budget.monthlyBudget) * 100;
      if (budgetPercent >= 100) {
        insights.push({
          type: 'danger',
          title: 'Budget Exceeded',
          message: `Overspent alert! You have spent ₹${totalSpent.toFixed(2)} which exceeds your set monthly budget of ₹${budget.monthlyBudget.toFixed(2)}.`
        });
        recommendations.push(`Reduce secondary items (e.g. Entertainment, Shopping) to recover your budget balance next month.`);
      } else if (budgetPercent >= 80) {
        insights.push({
          type: 'warning',
          title: '接近预算上限 (Nearing Budget Limit)',
          message: `Caution: Spent is at ${budgetPercent.toFixed(0)}% of your monthly allowance.`
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Budget Healthy',
          message: `Great job! You have used only ${budgetPercent.toFixed(0)}% of your set monthly limit.`
        });
      }
    } else {
      recommendations.push("Set a total monthly budget on the Budget page to track limits effectively.");
    }

    
    if (goals.length > 0) {
      const unachievedGoals = goals.filter(g => g.currentAmount < g.targetAmount);
      if (unachievedGoals.length > 0) {
        const primaryGoal = unachievedGoals[0];
        const monthlyAverageSavings = budget && budget.monthlyBudget ? Math.max(0, budget.monthlyBudget - totalSpent) : 0;
        
        if (monthlyAverageSavings > 0) {
          recommendations.push(`You have an estimated excess of ₹${monthlyAverageSavings.toFixed(0)} this month. Consider transferring ₹${(monthlyAverageSavings * 0.5).toFixed(0)} to your "${primaryGoal.goalName}" goal.`);
        } else {
          recommendations.push(`To fund "${primaryGoal.goalName}", try saving ₹500 from your weekly Shopping or Entertainment categories.`);
        }
      }
    } else {
      recommendations.push("Create a new Savings Goal (e.g. Emergency Fund) to start allocation.");
    }

    
    if (recommendations.length < 2) {
      recommendations.push("Keep expenses low during the first week of the month to build a safety margin.");
      recommendations.push("Automate bills tracking to avoid late payment utility penalties.");
    }

    res.json({
      hasData: true,
      highestCategory: {
        category: highestCategoryName,
        amount: highestCategoryAmount,
        percentage: highestCatPercent
      },
      categoryBreakdown: categoryTotals,
      monthlyTrends: monthlyTotals,
      predictions: {
        nextMonthForecast,
        averageMonthlyBurn: Math.round(averageMonthlyBurn)
      },
      insights,
      recommendations
    });
  } catch (error) {
    console.error('Analytics engine error:', error);
    res.status(500).json({ message: 'Server error generating financial insights.' });
  }
});









router.get('/expense-trend', auth, async (req, res) => {
  try {
    const { range = 'monthly' } = req.query;

    
    const now = new Date();
    let startDate = null;

    switch (range) {
      case 'last3months':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'last6months':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 180);
        break;
      case 'last1year':
      case 'monthly': 
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 84); 
        break;
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); 
        break;
      case 'alltime':
      default:
        startDate = null;
        break;
    }

    
    const filter = { userId: req.user.id };
    if (startDate) {
      filter.date = { $gte: startDate };
    }

    const expenses = await dbHelper.find('Expense', filter, { date: 1 });

    if (expenses.length === 0) {
      return res.json({ labels: [], data: [], range });
    }

    
    const buckets = {};

    const getWeekStart = (d) => {
      const dt = new Date(d);
      const day = dt.getDay(); 
      const diff = dt.getDate() - day + (day === 0 ? -6 : 1); 
      dt.setDate(diff);
      dt.setHours(0, 0, 0, 0);
      return dt;
    };

    const pad = (n) => String(n).padStart(2, '0');

    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;

      let key;
      if (range === 'daily' || range === 'last3months' || range === 'last6months') {
        
        key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      } else if (range === 'weekly') {
        const ws = getWeekStart(d);
        key = `${ws.getFullYear()}-W${pad(Math.ceil((ws.getDate()) / 7))} (${ws.toLocaleString('default', { month: 'short' })} ${ws.getDate()})`;
      } else {
        
        key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      }

      buckets[key] = (buckets[key] || 0) + e.amount;
    });

    
    const sortedKeys = Object.keys(buckets).sort((a, b) => {
      
      
      const parseKey = (k) => {
        if (/^\d{4}-\d{2}-\d{2}/.test(k)) return new Date(k).getTime();
        
        return new Date(k).getTime();
      };
      return parseKey(a) - parseKey(b);
    });

    
    const formatLabel = (key) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
        const d = new Date(key + 'T00:00:00');
        return d.toLocaleString('default', { month: 'short', day: 'numeric' });
      }
      return key; 
    };

    const labels = sortedKeys.map(formatLabel);
    const data = sortedKeys.map((k) => Math.round(buckets[k] * 100) / 100);

    res.json({ labels, data, range });
  } catch (error) {
    console.error('Expense trend error:', error);
    res.status(500).json({ message: 'Server error generating expense trend.' });
  }
});

module.exports = router;

