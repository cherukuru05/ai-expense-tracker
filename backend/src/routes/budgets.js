// budgets.js
const express = require('express');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;
    const budget = await Budget.findOne({ user: req.user.id, month: parseInt(month), year: parseInt(year) });
    res.json({ budget });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear(), totalBudget, categories } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, month, year },
      { totalBudget, categories },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ budget });
  } catch (e) { next(e); }
});

module.exports = router;