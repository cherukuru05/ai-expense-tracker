const mongoose = require('mongoose');

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Education', 'Travel', 'Other'];
const PAYMENT_MODES = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Wallet'];

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description too long'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: CATEGORIES,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  paymentMode: {
    type: String,
    enum: PAYMENT_MODES,
    default: 'UPI',
  },
  note: { type: String, maxlength: [500, 'Note too long'] },
  tags: [{ type: String, trim: true }],
  isRecurring: { type: Boolean, default: false },
  receiptUrl: { type: String },
  aiCategorized: { type: Boolean, default: false },
  location: { type: String },
}, {
  timestamps: true,
});

// Compound index for fast user+date queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.CATEGORIES = CATEGORIES;