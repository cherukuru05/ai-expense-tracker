const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const aiService = require('../services/aiService');

// GET /api/analytics/overview
exports.getOverview = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month || now.getMonth() + 1);
    const y = parseInt(year || now.getFullYear());

    const thisStart = new Date(y, m - 1, 1);
    const thisEnd = new Date(y, m, 0, 23, 59, 59);
    const prevStart = new Date(y, m - 2, 1);
    const prevEnd = new Date(y, m - 1, 0, 23, 59, 59);

    const [thisMonth, lastMonth, byCategory, daily] = await Promise.all([
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: thisStart, $lte: thisEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: prevStart, $lte: prevEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: thisStart, $lte: thisEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: thisStart, $lte: thisEnd } } },
        {
          $group: {
            _id: { $dayOfMonth: '$date' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    const currentTotal = thisMonth[0]?.total || 0;
    const previousTotal = lastMonth[0]?.total || 0;
    const changePercent = previousTotal > 0
      ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)
      : 0;

    res.json({
      totalSpent: currentTotal,
      transactionCount: thisMonth[0]?.count || 0,
      changePercent: parseFloat(changePercent),
      byCategory,
      dailySpending: daily,
      month: m, year: y,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/trend — last 6 months
exports.getTrend = async (req, res, next) => {
  try {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }

    const trend = await Promise.all(
      months.map(async ({ month, year }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const result = await Expense.aggregate([
          { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return { month, year, total: result[0]?.total || 0 };
      })
    );

    res.json({ trend });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/weekly — last 7 days daily breakdown
exports.getWeekly = async (req, res, next) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const result = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: weekAgo, $lte: today } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.json({ weekly: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/ai-insights
exports.getAIInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: start },
    }).lean();

    const budget = await Budget.findOne({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const insights = await aiService.generateInsights(expenses, budget);
    res.json({ insights });
  } catch (err) {
    next(err);
  }
};