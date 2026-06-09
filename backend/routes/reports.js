const express = require('express');
const router = express.Router();
const dbHelper = require('../config/db-helper');
const auth = require('../middleware/auth');




router.get('/', auth, async (req, res) => {
  const { type } = req.query; 
  
  if (!type) {
    return res.status(400).json({ message: 'Report type is required.' });
  }

  try {
    const expenses = await dbHelper.find('Expense', { userId: req.user.id });
    
    
    const now = new Date();
    let startDate = new Date();
    let title = '';

    if (type === 'daily') {
      startDate.setHours(0, 0, 0, 0);
      title = 'Daily Financial Report';
    } else if (type === 'weekly') {
      startDate.setDate(now.getDate() - 7);
      title = 'Weekly Financial Report';
    } else if (type === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
      title = 'Monthly Financial Report';
    } else if (type === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 1);
      title = 'Yearly Financial Report';
    } else {
      return res.status(400).json({ message: 'Invalid report type.' });
    }

    const filteredExpenses = expenses.filter(e => new Date(e.date) >= startDate);

    
    let totalSpent = 0;
    const categoryTotals = {};
    
    filteredExpenses.forEach(e => {
      totalSpent += e.amount;
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const averageExpense = filteredExpenses.length > 0 ? (totalSpent / filteredExpenses.length) : 0;

    
    await dbHelper.create('Report', {
      userId: req.user.id,
      reportType: type,
      periodStart: startDate,
      periodEnd: now,
      filePath: '' 
    });

    res.json({
      title,
      period: {
        start: startDate,
        end: now
      },
      summary: {
        totalSpent,
        transactionCount: filteredExpenses.length,
        averageTransaction: Math.round(averageExpense),
      },
      categoryBreakdown: categoryTotals,
      transactions: filteredExpenses
    });
  } catch (error) {
    console.error('Reports generation error:', error);
    res.status(500).json({ message: 'Server error compiling financial report.' });
  }
});

module.exports = router;
