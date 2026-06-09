const express = require('express');
const router = express.Router();
const dbHelper = require('../config/db-helper');
const auth = require('../middleware/auth');




router.get('/', auth, async (req, res) => {
  try {
    let budget = await dbHelper.findOne('Budget', { userId: req.user.id });
    if (!budget) {
      
      budget = await dbHelper.create('Budget', {
        userId: req.user.id,
        monthlyBudget: 0,
        categoryBudgets: {}
      });
    }
    res.json(budget);
  } catch (error) {
    console.error('Fetch budget error:', error);
    res.status(500).json({ message: 'Server error fetching budget details.' });
  }
});




router.post('/', auth, async (req, res) => {
  const { monthlyBudget, categoryBudgets } = req.body;
  const updates = {};

  if (monthlyBudget !== undefined) updates.monthlyBudget = parseFloat(monthlyBudget);
  if (categoryBudgets !== undefined) updates.categoryBudgets = categoryBudgets;

  try {
    let budget = await dbHelper.findOne('Budget', { userId: req.user.id });
    
    if (budget) {
      budget = await dbHelper.findByIdAndUpdate('Budget', budget._id || budget.id, updates);
    } else {
      budget = await dbHelper.create('Budget', {
        userId: req.user.id,
        monthlyBudget: updates.monthlyBudget || 0,
        categoryBudgets: updates.categoryBudgets || {}
      });
    }

    
    await checkBudgetAchievements(req.user.id, updates.monthlyBudget);

    res.json(budget);
  } catch (error) {
    console.error('Save budget error:', error);
    res.status(500).json({ message: 'Server error updating budget.' });
  }
});


async function checkBudgetAchievements(userId, monthlyBudget) {
  try {
    if (monthlyBudget > 0) {
      const exist = await dbHelper.findOne('Achievement', { userId, badgeName: 'Budget Keeper' });
      if (!exist) {
        await dbHelper.create('Achievement', {
          userId,
          badgeName: 'Budget Keeper',
          badgeDescription: 'First monthly budget goal defined! Start saving today.'
        });
      }
    }
  } catch (err) {
    console.error('Budget achievement check error:', err);
  }
}

module.exports = router;
