const jwt    = require('jsonwebtoken');
const  User  = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'pharmacy_secret_2024';

// Verify JWT and attach user to request
const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please log in.' });
    }
    const token = header.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user)        return res.status(401).json({ error: 'User not found.' });
    if (!user.active) return res.status(401).json({ error: 'Account is deactivated.' });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Session expired. Please log in again.' });
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// Role-based access guard
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Required roles: ${roles.join(', ')}` });
  }
  next();
};

module.exports = { auth, authorize };
