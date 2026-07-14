/**
 * FinTrack AI — Database Seed Script
 * Run: node src/seed.js
 * Creates a demo user with sample expenses, budgets and bills.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Budget = require('./models/Budget');
const Bill = require('./models/Bill');

const DEMO = {
  email: 'demo@fintrack.ai',
  password: 'demo1234',
  name: 'Demo User',
  monthlyIncome: 75000,
  currency: 'INR',
};

const now = new Date();
const thisMonth = now.getMonth();
const thisYear = now.getFullYear();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const sampleExpenses = [
  { description: 'Swiggy biryani', amount: 480, category: 'Food', date: daysAgo(1), paymentMode: 'UPI' },
  { description: 'Uber to office', amount: 220, category: 'Transport', date: daysAgo(2), paymentMode: 'UPI' },
  { description: 'Amazon order - books', amount: 1250, category: 'Shopping', date: daysAgo(3), paymentMode: 'Credit Card' },
  { description: 'BigBasket grocery', amount: 2100, category: 'Food', date: daysAgo(4), paymentMode: 'UPI' },
  { description: 'Netflix subscription', amount: 649, category: 'Entertainment', date: daysAgo(5), paymentMode: 'Debit Card' },
  { description: 'Jio mobile recharge', amount: 299, category: 'Utilities', date: daysAgo(6), paymentMode: 'UPI' },
  { description: 'Gym membership', amount: 2000, category: 'Health', date: daysAgo(7), paymentMode: 'Cash' },
  { description: 'Zomato lunch', amount: 320, category: 'Food', date: daysAgo(8), paymentMode: 'UPI' },
  { description: 'Electricity bill', amount: 1800, category: 'Utilities', date: daysAgo(9), paymentMode: 'Net Banking' },
  { description: 'Metro card recharge', amount: 500, category: 'Transport', date: daysAgo(10), paymentMode: 'UPI' },
  { description: 'Apollo pharmacy', amount: 680, category: 'Health', date: daysAgo(11), paymentMode: 'Cash' },
  { description: 'Udemy Python course', amount: 499, category: 'Education', date: daysAgo(12), paymentMode: 'Debit Card' },
  { description: 'Flipkart headphones', amount: 3499, category: 'Shopping', date: daysAgo(13), paymentMode: 'Credit Card' },
  { description: 'Ola auto ride', amount: 90, category: 'Transport', date: daysAgo(14), paymentMode: 'Wallet' },
  { description: 'PVR movie tickets', amount: 560, category: 'Entertainment', date: daysAgo(15), paymentMode: 'Credit Card' },
];

const sampleBudget = {
  month: thisMonth + 1,
  year: thisYear,
  totalBudget: 50000,
  categories: [
    { name: 'Food', limit: 8000, spent: 2900 },
    { name: 'Transport', limit: 3000, spent: 810 },
    { name: 'Shopping', limit: 5000, spent: 4749 },
    { name: 'Entertainment', limit: 2000, spent: 1209 },
    { name: 'Utilities', limit: 3000, spent: 2099 },
    { name: 'Health', limit: 4000, spent: 2680 },
    { name: 'Education', limit: 2000, spent: 499 },
  ],
};

const sampleBills = [
  { name: 'Rent', amount: 15000, dueDate: new Date(thisYear, thisMonth, 1), category: 'Utilities', repeat: 'monthly' },
  { name: 'Internet - Airtel', amount: 999, dueDate: new Date(thisYear, thisMonth, 10), category: 'Utilities', repeat: 'monthly' },
  { name: 'Netflix', amount: 649, dueDate: new Date(thisYear, thisMonth, 15), category: 'Entertainment', repeat: 'monthly' },
  { name: 'Car Insurance', amount: 8500, dueDate: new Date(thisYear, thisMonth + 2, 20), category: 'Transport', repeat: 'yearly' },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected');

  // ── Create/reset ADMIN user ──────────────────────────
  const ADMIN_EMAIL = 'admin@fintrack.ai';
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    await User.deleteOne({ _id: existingAdmin._id });
  }
  const adminUser = await User.create({
    name: 'Admin User',
    email: ADMIN_EMAIL,
    password: 'admin1234',
    monthlyIncome: 0,
    currency: 'INR',
    role: 'admin',
  });
  console.log(`✅ Admin user created: ${adminUser.email} (role: admin)`);

  // ── Create/reset DEMO user ───────────────────────────
  const existing = await User.findOne({ email: DEMO.email });
  if (existing) {
    console.log('🧹 Removing previous demo data...');
    await Expense.deleteMany({ user: existing._id });
    await Budget.deleteMany({ user: existing._id });
    await Bill.deleteMany({ user: existing._id });
    await User.deleteOne({ _id: existing._id });
  }

  // Create demo user
  console.log('👤 Creating demo user...');
  const user = await User.create({
    name: DEMO.name,
    email: DEMO.email,
    password: DEMO.password,
    monthlyIncome: DEMO.monthlyIncome,
    currency: DEMO.currency,
    role: 'user',
  });
  console.log(`✅ Demo user created: ${user.email}`);

  // Create expenses
  console.log('💸 Seeding expenses...');
  const expenses = sampleExpenses.map((e) => ({ ...e, user: user._id }));
  await Expense.insertMany(expenses);
  console.log(`✅ ${expenses.length} expenses created`);

  // Create budget
  console.log('📊 Seeding budget...');
  await Budget.create({ ...sampleBudget, user: user._id });
  console.log('✅ Budget created');

  // Create bills
  console.log('🔔 Seeding bills...');
  const bills = sampleBills.map((b) => ({ ...b, user: user._id }));
  await Bill.insertMany(bills);
  console.log(`✅ ${bills.length} bill reminders created`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('  ADMIN PORTAL LOGIN:');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log('   Password: admin1234');
  console.log('');
  console.log('  APP LOGIN (Demo User):');
  console.log(`   Email:    ${DEMO.email}`);
  console.log(`   Password: ${DEMO.password}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
