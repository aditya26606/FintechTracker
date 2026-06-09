const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dbHelper = require('../config/db-helper');
const auth = require('../middleware/auth');


const uploadDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter
});




router.get('/', auth, async (req, res) => {
  const { category, startDate, endDate, search } = req.query;
  const filter = { userId: req.user.id };

  if (category) {
    filter.category = category;
  }

  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  try {
    let list = await dbHelper.find('Expense', filter, { date: -1 });

    
    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter(item => 
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.category && item.category.toLowerCase().includes(searchLower))
      );
    }

    res.json(list);
  } catch (error) {
    console.error('Fetch expenses error:', error);
    res.status(500).json({ message: 'Server error fetching expenses.' });
  }
});




router.post('/', auth, upload.single('receipt'), async (req, res) => {
  let { date, amount, category, description } = req.body;

  if (!date || !amount || !category) {
    return res.status(400).json({ message: 'Please enter date, amount, and category.' });
  }

  try {
    const receiptFile = req.file ? `/uploads/receipts/${req.file.filename}` : '';

    const newExpense = await dbHelper.create('Expense', {
      userId: req.user.id,
      date: new Date(date),
      amount: parseFloat(amount),
      category,
      description: description || '',
      receiptFile
    });

    
    await checkAchievements(req.user.id);

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error saving expense.' });
  }
});




router.put('/:id', auth, upload.single('receipt'), async (req, res) => {
  let { date, amount, category, description } = req.body;
  const updates = {};

  if (date) updates.date = new Date(date);
  if (amount) updates.amount = parseFloat(amount);
  if (category) updates.category = category;
  if (description !== undefined) updates.description = description;
  
  if (req.file) {
    updates.receiptFile = `/uploads/receipts/${req.file.filename}`;
  }

  try {
    
    const expense = await dbHelper.findById('Expense', req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to edit this expense.' });
    }

    const updatedExpense = await dbHelper.findByIdAndUpdate('Expense', req.params.id, updates);
    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error updating expense.' });
  }
});




router.delete('/:id', auth, async (req, res) => {
  try {
    
    const expense = await dbHelper.findById('Expense', req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this expense.' });
    }

    
    if (expense.receiptFile) {
      const filePath = path.join(__dirname, '..', expense.receiptFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await dbHelper.findByIdAndDelete('Expense', req.params.id);
    res.json({ message: 'Expense removed successfully.' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error deleting expense.' });
  }
});


async function checkAchievements(userId) {
  try {
    const count = await dbHelper.count('Expense', { userId });
    
    
    if (count >= 1) {
      const exist = await dbHelper.findOne('Achievement', { userId, badgeName: 'First Expense Added' });
      if (!exist) {
        await dbHelper.create('Achievement', {
          userId,
          badgeName: 'First Expense Added',
          badgeDescription: 'You started your journey by logging your first expense!'
        });
      }
    }

    
    if (count >= 20) {
      const exist = await dbHelper.findOne('Achievement', { userId, badgeName: 'Expense Master' });
      if (!exist) {
        await dbHelper.create('Achievement', {
          userId,
          badgeName: 'Expense Master',
          badgeDescription: 'Financial discipline pro! Logged 20+ transactions.'
        });
      }
    }
  } catch (err) {
    console.error('Achievements unlock error:', err);
  }
}

module.exports = router;
