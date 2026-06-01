const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  category: {
    type: String,
    enum: ['Utilities', 'Entertainment', 'Health', 'Education', 'Housing', 'Transport', 'Other'],
    default: 'Other',
  },
  repeat: {
    type: String,
    enum: ['none', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
  },
  paymentMode: { type: String, default: 'Auto-debit' },
  isPaid: { type: Boolean, default: false },
  paidDate: { type: Date },
  reminderSent: { type: Boolean, default: false },
  aiDetected: { type: Boolean, default: false },
  notes: { type: String },
}, {
  timestamps: true,
});

billSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Bill', billSchema);