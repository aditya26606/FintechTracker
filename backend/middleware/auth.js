const jwt = require('jsonwebtoken');
const dbHelper = require('../config/db-helper');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header. Access denied.' });
  }

  
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid. Use "Bearer <token>".' });
  }

  const token = tokenParts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fdf6e987c093a123f3a8bce5d87a6c9e012356ab9cd4d5f190e2b34a5d');
    
    
    const user = await dbHelper.findById('User', decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found. Access denied.' });
    }

    if (user.tokenVersion !== undefined && decoded.tokenVersion !== undefined && user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Session invalidated. Please log in again.' });
    }

    req.user = decoded; 
    next();
  } catch (error) {
    console.error('JWT Verification error:', error.message);
    res.status(401).json({ message: 'Token is invalid or expired. Access denied.' });
  }
};

module.exports = authMiddleware;
