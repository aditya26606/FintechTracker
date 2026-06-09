const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeName: {
    type: String,
    required: true
  },
  badgeDescription: {
    type: String,
    required: true
  },
  achievedAt: {
    type: Date,
    default: Date.now
  }
});


AchievementSchema.index({ userId: 1, badgeName: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
