const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// PUT /api/users/profile — Update user profile details
router.put('/profile', async (req, res, next) => {
  try {
    const { name, phone, currency, monthlyIncome, notificationPrefs } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (currency !== undefined) user.currency = currency;
    if (monthlyIncome !== undefined) user.monthlyIncome = monthlyIncome;
    if (notificationPrefs !== undefined) {
      user.notificationPrefs = {
        ...user.notificationPrefs.toObject(),
        ...notificationPrefs
      };
    }

    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/password — Change password
router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Invalid current password' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/all — Admin: list all users
router.get('/all', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password');
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/role — Admin: change user role
router.put('/:id/role', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
