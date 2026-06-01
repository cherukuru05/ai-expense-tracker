const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

// GET /api/expenses
exports.getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, category, startDate, endDate,
      paymentMode, search, sortBy = 'date', order = 'desc',
    } = req.query;

    const filter = { user: req.user.id };
    if (category) filter.category = category;
    if (paymentMode) filter.paymentMode = paymentMode;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) filter.description = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(filter),
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/expenses
exports.createExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let { description, amount, category, date, paymentMode, note, tags, isRecurring, location } = req.body;

    // AI auto-categorization if category not provided
    let aiCategorized = false;
    if (!category || category === 'Other') {
      try {
        category = await aiService.categorizeExpense(description, amount);
        aiCategorized = true;
      } catch (e) {
        logger.warn('AI categorization failed, using fallback');
        category = category || 'Other';
      }
    }

    const expense = await Expense.create({
      user: req.user.id,
      description, amount, category,
      date: date || new Date(),
      paymentMode, note, tags, isRecurring, location, aiCategorized,
    });

    // Update budget spent amount
    await updateBudgetSpent(req.user.id, category, amount, new Date(date || Date.now()));

    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
};

// GET /api/expenses/:id
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

// PUT /api/expenses/:id
exports.updateExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/expenses/summary — month totals by category
exports.getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month || now.getMonth() + 1);
    const y = parseInt(year || now.getFullYear());

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const summary = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const totalSpent = summary.reduce((acc, s) => acc + s.total, 0);
    res.json({ summary, totalSpent, month: m, year: y });
  } catch (err) {
    next(err);
  }
};

// Internal: update budget spent
async function updateBudgetSpent(userId, category, amount, date) {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    await Budget.updateOne(
      { user: userId, month, year, 'categories.name': category },
      { $inc: { 'categories.$.spent': amount } }
    );
  } catch (e) {
    logger.warn('Budget update failed:', e.message);
  }
}