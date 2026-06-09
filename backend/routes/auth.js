const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dbHelper = require('../config/db-helper');
const auth = require('../middleware/auth');


const profileUploadDir = path.join(__dirname, '../uploads/profile');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const profileFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF images are allowed.'), false);
  }
};

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: profileFileFilter
});

const JWT_SECRET = process.env.JWT_SECRET || 'fdf6e987c093a123f3a8bce5d87a6c9e012356ab9cd4d5f190e2b34a5d';




router.post('/register', async (req, res) => {
  const { name, email, mobile, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    
    const userExists = await dbHelper.findOne('User', { email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    
    const newUser = await dbHelper.create('User', {
      name,
      email,
      mobile: mobile || '',
      password: passwordHash,
      profilePhoto: '',
      preferences: {
        theme: 'dark',
        currency: 'INR',
        notificationsEnabled: true
      }
    });

    
    await dbHelper.create('Budget', {
      userId: newUser._id || newUser.id,
      monthlyBudget: 0,
      categoryBudgets: {}
    });

    
    const token = jwt.sign(
      { id: newUser._id || newUser.id, email: newUser.email, tokenVersion: newUser.tokenVersion || 0 },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        profilePhoto: newUser.profilePhoto,
        preferences: newUser.preferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});




router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    
    const user = await dbHelper.findOne('User', { email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, tokenVersion: user.tokenVersion || 0 },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profilePhoto: user.profilePhoto,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});




router.get('/profile', auth, async (req, res) => {
  try {
    const user = await dbHelper.findById('User', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    
    const userResponse = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      profilePhoto: user.profilePhoto,
      preferences: user.preferences
    };
    res.json(userResponse);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});




router.put('/profile', auth, async (req, res) => {
  const { name, email, mobile, preferences, profilePhoto } = req.body;
  const updates = {};
  
  if (name) updates.name = name;
  if (mobile !== undefined) updates.mobile = mobile;
  if (preferences) updates.preferences = preferences;
  if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

  try {
    if (email) {
      const emailLower = email.toLowerCase();
      
      const existing = await dbHelper.findOne('User', { email: emailLower });
      if (existing && existing._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email is already taken by another user.' });
      }
      updates.email = emailLower;
    }

    const updatedUser = await dbHelper.findByIdAndUpdate('User', req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      id: updatedUser._id || updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      profilePhoto: updatedUser.profilePhoto,
      preferences: updatedUser.preferences
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});




router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new passwords.' });
  }

  try {
    const user = await dbHelper.findById('User', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await dbHelper.findByIdAndUpdate('User', req.user.id, { password: newPasswordHash });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error updating password.' });
  }
});




router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await dbHelper.findOne('User', { email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email.' });
    }

    
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[Forgot Password] Demo PIN for ${email}: ${pin}`);
    
    
    res.json({
      message: 'Demo mode: Reset instructions and PIN sent to your email (simulated).',
      pin: pin 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error initiating password reset.' });
  }
});




router.post('/profile-photo', auth, uploadProfile.single('profilePhoto'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const profilePhotoUrl = `/uploads/profile/${req.file.filename}`;
    
    
    const updatedUser = await dbHelper.findByIdAndUpdate('User', req.user.id, {
      profilePhoto: profilePhotoUrl
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: 'Profile picture uploaded successfully.',
      profilePhoto: profilePhotoUrl
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Server error uploading profile picture.' });
  }
});




router.post('/logout-all', auth, async (req, res) => {
  try {
    const user = await dbHelper.findById('User', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const nextVersion = (user.tokenVersion || 0) + 1;
    await dbHelper.findByIdAndUpdate('User', req.user.id, {
      tokenVersion: nextVersion
    });

    res.json({ message: 'Logged out from all devices successfully.' });
  } catch (error) {
    console.error('Logout all devices error:', error);
    res.status(500).json({ message: 'Server error logging out from all devices.' });
  }
});




router.delete('/delete-account', auth, async (req, res) => {
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

    
    const budgets = await dbHelper.find('Budget', { userId });
    for (const b of budgets) {
      await dbHelper.findByIdAndDelete('Budget', b._id || b.id);
    }

    
    const goals = await dbHelper.find('SavingsGoal', { userId });
    for (const g of goals) {
      await dbHelper.findByIdAndDelete('SavingsGoal', g._id || g.id);
    }

    
    const achievements = await dbHelper.find('Achievement', { userId });
    for (const a of achievements) {
      await dbHelper.findByIdAndDelete('Achievement', a._id || a.id);
    }

    
    const user = await dbHelper.findById('User', userId);
    if (user && user.profilePhoto && user.profilePhoto.startsWith('/uploads/profile/')) {
      const photoPath = path.join(__dirname, '..', user.profilePhoto);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    
    await dbHelper.findByIdAndDelete('User', userId);

    res.json({ message: 'Account and all associated data deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error deleting account.' });
  }
});

module.exports = router;
