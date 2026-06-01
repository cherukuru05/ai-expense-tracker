const express = require('express');
const aiService = require('../services/aiService');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

// POST /api/ai/categorize — auto-categorize a description
router.post('/categorize', async (req, res, next) => {
  try {
    const { description, amount } = req.body;
    const category = await aiService.categorizeExpense(description, amount);
    res.json({ category });
  } catch (e) { next(e); }
});

// GET /api/ai/predict — predict month-end spending
router.get('/predict', async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const result = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const currentSpent = result[0]?.total || 0;
    const prediction = await aiService.predictMonthEnd(req.user.id, currentSpent, now.getDate());
    res.json({ currentSpent, prediction, dayOfMonth: now.getDate() });
  } catch (e) { next(e); }
});

// GET /api/ai/budget-suggestion — AI suggests optimal budget allocations
router.get('/budget-suggestion', async (req, res, next) => {
  try {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const history = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: threeMonthsAgo } } },
      { $group: { _id: '$category', avg: { $avg: '$amount' }, total: { $sum: '$amount' } } },
    ]);

    const suggestions = history.map((h) => ({
      category: h._id,
      suggested: Math.round(h.avg * 1.1),
      based_on: '3-month average',
    }));

    res.json({ suggestions });
  } catch (e) { next(e); }
});

module.exports = router;