const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const dbHelper = require('../config/db-helper');
const auth = require('../middleware/auth');




router.get('/backup', auth, async (req, res) => {
  try {
    const user = await dbHelper.findById('User', req.user.id);
    const expenses = await dbHelper.find('Expense', { userId: req.user.id });
    const budget = await dbHelper.findOne('Budget', { userId: req.user.id });
    const goals = await dbHelper.find('SavingsGoal', { userId: req.user.id });
    const achievements = await dbHelper.find('Achievement', { userId: req.user.id });

    const backupData = {
      exportVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        preferences: user.preferences
      },
      budget: budget ? {
        monthlyBudget: budget.monthlyBudget,
        categoryBudgets: budget.categoryBudgets
      } : null,
      expenses: expenses.map(e => ({
        date: e.date,
        amount: e.amount,
        category: e.category,
        description: e.description
      })),
      goals: goals.map(g => ({
        goalName: g.goalName,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate
      })),
      achievements: achievements.map(a => ({
        badgeName: a.badgeName,
        badgeDescription: a.badgeDescription,
        achievedAt: a.achievedAt
      }))
    };

    res.json(backupData);
  } catch (error) {
    console.error('Settings backup error:', error);
    res.status(500).json({ message: 'Server error generating profile backup.' });
  }
});




router.post('/restore', auth, async (req, res) => {
  const { backupData } = req.body;

  if (!backupData || !backupData.expenses) {
    return res.status(400).json({ message: 'Invalid backup file content.' });
  }

  try {
    const userId = req.user.id;

    
    if (backupData.budget) {
      let budget = await dbHelper.findOne('Budget', { userId });
      if (budget) {
        await dbHelper.findByIdAndUpdate('Budget', budget._id || budget.id, {
          monthlyBudget: backupData.budget.monthlyBudget,
          categoryBudgets: backupData.budget.categoryBudgets || {}
        });
      } else {
        await dbHelper.create('Budget', {
          userId,
          monthlyBudget: backupData.budget.monthlyBudget,
          categoryBudgets: backupData.budget.categoryBudgets || {}
        });
      }
    }

    
    if (backupData.user && backupData.user.preferences) {
      await dbHelper.findByIdAndUpdate('User', userId, {
        preferences: backupData.user.preferences
      });
    }

    
    const oldExpenses = await dbHelper.find('Expense', { userId });
    for (const exp of oldExpenses) {
      await dbHelper.findByIdAndDelete('Expense', exp._id || exp.id);
    }

    for (const exp of backupData.expenses) {
      await dbHelper.create('Expense', {
        userId,
        date: new Date(exp.date),
        amount: parseFloat(exp.amount),
        category: exp.category,
        description: exp.description || '',
        receiptFile: ''
      });
    }

    
    const oldGoals = await dbHelper.find('SavingsGoal', { userId });
    for (const goal of oldGoals) {
      await dbHelper.findByIdAndDelete('SavingsGoal', goal._id || goal.id);
    }

    if (backupData.goals) {
      for (const goal of backupData.goals) {
        await dbHelper.create('SavingsGoal', {
          userId,
          goalName: goal.goalName,
          targetAmount: parseFloat(goal.targetAmount),
          currentAmount: parseFloat(goal.currentAmount || 0),
          targetDate: new Date(goal.targetDate)
        });
      }
    }

    
    const oldAchievements = await dbHelper.find('Achievement', { userId });
    for (const ach of oldAchievements) {
      await dbHelper.findByIdAndDelete('Achievement', ach._id || ach.id);
    }

    if (backupData.achievements) {
      for (const ach of backupData.achievements) {
        try {
          await dbHelper.create('Achievement', {
            userId,
            badgeName: ach.badgeName,
            badgeDescription: ach.badgeDescription,
            achievedAt: ach.achievedAt ? new Date(ach.achievedAt) : new Date()
          });
        } catch (e) {
          
        }
      }
    }

    res.json({ message: 'Profile data restored successfully.' });
  } catch (error) {
    console.error('Settings restore error:', error);
    res.status(500).json({ message: 'Server error restoring profile data.' });
  }
});




router.post('/clear-data', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    
    const expenses = await dbHelper.find('Expense', { userId });
    for (const exp of expenses) {
      if (exp.receiptFile) {
        const filePath = path.join(__dirname, '..', exp.receiptFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      await dbHelper.findByIdAndDelete('Expense', exp._id || exp.id);
    }

    
    const budget = await dbHelper.findOne('Budget', { userId });
    if (budget) {
      await dbHelper.findByIdAndDelete('Budget', budget._id || budget.id);
    }

    
    await dbHelper.create('Budget', {
      userId,
      monthlyBudget: 0,
      categoryBudgets: {}
    });

    
    const goals = await dbHelper.find('SavingsGoal', { userId });
    for (const g of goals) {
      await dbHelper.findByIdAndDelete('SavingsGoal', g._id || g.id);
    }

    
    const achievements = await dbHelper.find('Achievement', { userId });
    for (const a of achievements) {
      await dbHelper.findByIdAndDelete('Achievement', a._id || a.id);
    }

    res.json({ message: 'All transactions and user records cleared successfully.' });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ message: 'Server error clearing user data.' });
  }
});




router.post('/import', auth, async (req, res) => {
  const { expenses } = req.body;

  if (!expenses || !Array.isArray(expenses)) {
    return res.status(400).json({ message: 'Invalid expenses format. Must be an array.' });
  }

  try {
    const userId = req.user.id;
    const importedExpenses = [];

    for (const item of expenses) {
      const { date, amount, category, description } = item;
      
      if (!amount || !category) continue; 
      
      const newExpense = await dbHelper.create('Expense', {
        userId,
        date: date ? new Date(date) : new Date(),
        amount: parseFloat(amount),
        category,
        description: description || '',
        receiptFile: ''
      });
      importedExpenses.push(newExpense);
    }

    res.json({ 
      message: `Successfully imported ${importedExpenses.length} expenses.`,
      count: importedExpenses.length
    });
  } catch (error) {
    console.error('Import expenses error:', error);
    res.status(500).json({ message: 'Server error importing expenses.' });
  }
});

module.exports = router;
