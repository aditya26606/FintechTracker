const express = require('express');
const router = express.Router();
const dbHelper = require('../config/db-helper');
const auth = require('../middleware/auth');




router.get('/', auth, async (req, res) => {
  try {
    const list = await dbHelper.find('SavingsGoal', { userId: req.user.id });
    res.json(list);
  } catch (error) {
    console.error('Fetch goals error:', error);
    res.status(500).json({ message: 'Server error fetching savings goals.' });
  }
});




router.post('/', auth, async (req, res) => {
  const { goalName, targetAmount, targetDate } = req.body;

  if (!goalName || !targetAmount || !targetDate) {
    return res.status(400).json({ message: 'Provide goal name, target amount, and target date.' });
  }

  try {
    const newGoal = await dbHelper.create('SavingsGoal', {
      userId: req.user.id,
      goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      targetDate: new Date(targetDate)
    });
    
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error creating savings goal.' });
  }
});




router.put('/:id', auth, async (req, res) => {
  const { goalName, targetAmount, targetDate } = req.body;
  const updates = {};

  if (goalName) updates.goalName = goalName;
  if (targetAmount) updates.targetAmount = parseFloat(targetAmount);
  if (targetDate) updates.targetDate = new Date(targetDate);

  try {
    const goal = await dbHelper.findById('SavingsGoal', req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found.' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access to savings goal.' });
    }

    const updatedGoal = await dbHelper.findByIdAndUpdate('SavingsGoal', req.params.id, updates);
    res.json(updatedGoal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error updating savings goal.' });
  }
});




router.put('/:id/fund', auth, async (req, res) => {
  const { amount } = req.body;

  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Please specify a valid contribution amount.' });
  }

  try {
    const goal = await dbHelper.findById('SavingsGoal', req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found.' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access to savings goal.' });
    }

    const newBalance = parseFloat(goal.currentAmount) + parseFloat(amount);
    const updatedGoal = await dbHelper.findByIdAndUpdate('SavingsGoal', req.params.id, {
      currentAmount: newBalance
    });

    
    if (newBalance >= goal.targetAmount) {
      await unlockGoalAchievement(req.user.id, goal.goalName);
    }

    res.json(updatedGoal);
  } catch (error) {
    console.error('Funding goal error:', error);
    res.status(500).json({ message: 'Server error funding savings goal.' });
  }
});




router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await dbHelper.findById('SavingsGoal', req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found.' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access to savings goal.' });
    }

    await dbHelper.findByIdAndDelete('SavingsGoal', req.params.id);
    res.json({ message: 'Savings goal deleted.' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error deleting goal.' });
  }
});


async function unlockGoalAchievement(userId, goalName) {
  try {
    
    const existGeneral = await dbHelper.findOne('Achievement', { userId, badgeName: 'Savings Champion' });
    if (!existGeneral) {
      await dbHelper.create('Achievement', {
        userId,
        badgeName: 'Savings Champion',
        badgeDescription: 'Secured first place savings! Completed a financial savings goal.'
      });
    }
    
    const existGoalSpecific = await dbHelper.findOne('Achievement', { userId, badgeName: 'Goal Achiever' });
    if (!existGoalSpecific) {
      await dbHelper.create('Achievement', {
        userId,
        badgeName: 'Goal Achiever',
        badgeDescription: `Success! Successfully fully funded savings target goal: "${goalName}"`
      });
    }
  } catch (err) {
    console.error('Goal achievement check error:', err);
  }
}

module.exports = router;
