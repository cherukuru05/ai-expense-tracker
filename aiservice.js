const axios = require('axios');
const logger = require('../utils/logger');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Category keywords fallback (when ML service is unavailable)
const KEYWORD_MAP = {
  Food: ['swiggy', 'zomato', 'restaurant', 'cafe', 'hotel', 'food', 'grocery', 'dmart', 'bigbasket', 'dinner', 'lunch', 'breakfast'],
  Transport: ['uber', 'ola', 'metro', 'bus', 'petrol', 'diesel', 'cab', 'auto', 'rapido', 'train', 'irctc'],
  Entertainment: ['netflix', 'hotstar', 'spotify', 'amazon prime', 'movie', 'theatre', 'pvr', 'inox'],
  Health: ['gym', 'pharmacy', 'hospital', 'doctor', 'medicine', 'apollo', 'medplus', 'clinic'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'shopping', 'mall', 'clothes'],
  Utilities: ['electricity', 'water', 'gas', 'broadband', 'wifi', 'airtel', 'jio', 'bsnl', 'mobile'],
  Education: ['udemy', 'coursera', 'book', 'course', 'college', 'fees', 'school'],
};

exports.categorizeExpense = async (description, amount) => {
  // Try ML service first
  try {
    const response = await axios.post(`${ML_URL}/categorize`, {
      description,
      amount,
    }, { timeout: 3000 });
    return response.data.category;
  } catch (err) {
    logger.warn('ML service unavailable, using keyword fallback');
  }

  // Keyword fallback
  const lower = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some((k) => lower.includes(k))) return cat;
  }
  return 'Other';
};

exports.generateInsights = async (expenses, budget) => {
  // Try ML service
  try {
    const response = await axios.post(`${ML_URL}/insights`, {
      expenses,
      budget,
    }, { timeout: 5000 });
    return response.data.insights;
  } catch (err) {
    logger.warn('ML insights unavailable, using rule-based fallback');
  }

  // Rule-based fallback insights
  const insights = [];
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  if (budget) {
    budget.categories.forEach((bc) => {
      const spent = byCategory[bc.name] || 0;
      const pct = Math.round((spent / bc.limit) * 100);
      if (pct >= 90) {
        insights.push({ type: 'warning', category: bc.name, message: `${bc.name} budget is ${pct}% used. Consider reducing spend.` });
      } else if (pct >= 70) {
        insights.push({ type: 'caution', category: bc.name, message: `${bc.name} budget at ${pct}%. Monitor carefully.` });
      }
    });
  }

  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  if (topCat) {
    insights.push({ type: 'info', category: topCat[0], message: `Your highest spend this month is ${topCat[0]} at ₹${topCat[1].toLocaleString()}.` });
  }

  return insights;
};

exports.predictMonthEnd = async (userId, currentSpent, dayOfMonth) => {
  try {
    const response = await axios.post(`${ML_URL}/predict`, {
      userId, currentSpent, dayOfMonth,
    }, { timeout: 3000 });
    return response.data.prediction;
  } catch (err) {
    // Linear projection fallback
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    return Math.round((currentSpent / dayOfMonth) * daysInMonth);
  }
};