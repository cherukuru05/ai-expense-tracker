const PDFDocument = require('pdfkit');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const User = require('../models/User');

// GET /api/reports/monthly?month=6&year=2026
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month || now.getMonth() + 1);
    const y = parseInt(year || now.getFullYear());

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const [expenses, budget, user] = await Promise.all([
      Expense.find({ user: req.user.id, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      Budget.findOne({ user: req.user.id, month: m, year: y }),
      User.findById(req.user.id),
    ]);

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    res.json({
      report: {
        user: { name: user.name, email: user.email },
        period: { month: m, year: y },
        totalSpent,
        totalBudget: budget?.totalBudget || 0,
        savings: (user.monthlyIncome || 0) - totalSpent,
        savingsRate: user.monthlyIncome
          ? (((user.monthlyIncome - totalSpent) / user.monthlyIncome) * 100).toFixed(1)
          : 0,
        byCategory,
        transactions: expenses.length,
        expenses: expenses.slice(0, 50),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/monthly/pdf
exports.downloadPDF = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month || now.getMonth() + 1);
    const y = parseInt(year || now.getFullYear());

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const [expenses, user] = await Promise.all([
      Expense.find({ user: req.user.id, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      User.findById(req.user.id),
    ]);

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const monthName = new Date(y, m - 1).toLocaleString('default', { month: 'long' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=FinTrack-Report-${monthName}-${y}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('FinTrack AI', 50, 50);
    doc.fontSize(12).font('Helvetica').fillColor('#666').text(`Financial Report — ${monthName} ${y}`, 50, 80);
    doc.fillColor('#000').moveDown(2);

    // Summary
    doc.fontSize(14).font('Helvetica-Bold').text('Summary', 50, 120);
    doc.moveTo(50, 138).lineTo(550, 138).stroke('#ddd');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Name: ${user.name}`, 50, 148);
    doc.text(`Total Spent: ₹${totalSpent.toLocaleString()}`, 50, 164);
    doc.text(`Transactions: ${expenses.length}`, 50, 180);

    // Transactions table
    doc.moveDown(3);
    doc.fontSize(14).font('Helvetica-Bold').text('Transactions', 50, 220);
    doc.moveTo(50, 238).lineTo(550, 238).stroke('#ddd');

    let y2 = 250;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', 50, y2);
    doc.text('Description', 130, y2);
    doc.text('Category', 310, y2);
    doc.text('Amount', 460, y2, { align: 'right' });
    y2 += 16;
    doc.font('Helvetica');

    expenses.slice(0, 40).forEach((e) => {
      if (y2 > 720) { doc.addPage(); y2 = 50; }
      doc.text(new Date(e.date).toLocaleDateString(), 50, y2);
      doc.text(e.description.substring(0, 30), 130, y2);
      doc.text(e.category, 310, y2);
      doc.text(`₹${e.amount.toLocaleString()}`, 460, y2, { align: 'right' });
      y2 += 14;
    });

    doc.end();
  } catch (err) {
    next(err);
  }
};