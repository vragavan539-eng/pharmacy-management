const express = require('express');
const jwt     = require('jsonwebtoken');
const router  = express.Router();
const User    = require('../models/User');
const { auth } = require('../middleware/auth');

const SECRET  = process.env.JWT_SECRET || 'pharmacy_secret_2024';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: EXPIRES });

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const user  = await User.create({ name, email, password, role, phone });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.active) return res.status(401).json({ error: 'Account deactivated. Contact admin.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => res.json(req.user));

// GET /api/auth/users  (admin only)
router.get('/users', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
});

// PATCH /api/auth/users/:id/toggle
router.patch('/users/:id/toggle', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.active = !user.active;
    await user.save({ validateBeforeSave: false });
    res.json({ message: `User ${user.active ? 'activated' : 'deactivated'}`, active: user.active });
  } catch (err) { next(err); }
});

module.exports = router;
