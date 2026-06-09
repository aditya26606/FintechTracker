const express = require('express');
const router = express.Router();
const dbHelper = require('../config/db-helper');
const auth = require('../middleware/auth');




router.get('/', auth, async (req, res) => {
  try {
    const expenses = await dbHelper.find('Expense', { userId: req.user.id });
    const budget = await dbHelper.findOne('Budget', { userId: req.user.id });
    const goals = await dbHelper.find('SavingsGoal', { userId: req.user.id });
    const badges = await dbHelper.find('Achievement', { userId: req.user.id });

    
    
    
    
    
    
    
    let xp = 100;
    xp += expenses.length * 50;
    if (budget && budget.monthlyBudget > 0) xp += 100;
    xp += goals.length * 100;
    
    const fullyFundedGoals = goals.filter(g => g.currentAmount >= g.targetAmount);
    xp += fullyFundedGoals.length * 300;
    xp += badges.length * 150;

    
    const level = Math.floor(xp / 500) + 1;
    const currentLevelXP = xp % 500;
    const nextLevelXPNeeded = 500;
    const xpPercent = Math.min((currentLevelXP / nextLevelXPNeeded) * 100, 100);

    
    const badgesMasterlist = [
      {
        name: 'First Expense Added',
        description: 'You started your journey by logging your first expense!',
        icon: '💵',
        category: 'expenses'
      },
      {
        name: 'Expense Master',
        description: 'Financial discipline pro! Logged 20+ transactions.',
        icon: '📊',
        category: 'expenses'
      },
      {
        name: 'Budget Keeper',
        description: 'First monthly budget goal defined! Start saving today.',
        icon: '🛡️',
        category: 'budgets'
      },
      {
        name: 'Savings Champion',
        description: 'Secured first place savings! Completed a financial savings goal.',
        icon: '🏆',
        category: 'savings'
      },
      {
        name: 'Goal Achiever',
        description: 'Completed savings goals targets.',
        icon: '⭐',
        category: 'savings'
      },
      {
        name: '30-Day Streak',
        description: 'Maintained financial tracking for 30 consecutive days.',
        icon: '🔥',
        category: 'streaks'
      }
    ];

    
    const processedBadges = badgesMasterlist.map(badge => {
      const unlocked = badges.find(b => b.badgeName === badge.name);
      return {
        ...badge,
        isUnlocked: !!unlocked,
        achievedAt: unlocked ? unlocked.achievedAt : null
      };
    });

    
    
    const activeStreak = expenses.length >= 5;
    if (activeStreak) {
      const streakBadge = processedBadges.find(b => b.name === '30-Day Streak');
      if (streakBadge && !streakBadge.isUnlocked) {
        
        await dbHelper.create('Achievement', {
          userId: req.user.id,
          badgeName: '30-Day Streak',
          badgeDescription: 'Maintained financial tracking for 30 consecutive days.'
        });
        streakBadge.isUnlocked = true;
        streakBadge.achievedAt = new Date().toISOString();
        xp += 150; 
      }
    }

    res.json({
      level,
      xp,
      currentLevelXP,
      nextLevelXPNeeded,
      xpPercent,
      badges: processedBadges
    });
  } catch (error) {
    console.error('Achievements engine error:', error);
    res.status(500).json({ message: 'Server error loading achievements.' });
  }
});

module.exports = router;
